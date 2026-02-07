import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { UIMessage, ChatStatus } from 'ai'
import type {
  ChatThreadDTO,
  ChatMessageDTO,
  ChatMessageNewPayload,
  ChatMessageDeltaPayload,
  ChatReadUpdatedPayload,
  ChatSocketEnvelope
} from '#shared/types/chat'
import { CHAT_EVENTS } from '~/composables/chatEvents'
import { useChatSocket } from '~/composables/useChatSocket'
import { useChatResource } from '~/composables/resources/useChatResource'
import { useAuth } from '~/composables/useAuth'

const createTempId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `temp_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const createPendingId = () => -Math.floor(Date.now() + Math.random() * 1000)

export const useChatStore = defineStore('chat', () => {
  const socket = useChatSocket()
  const resource = useChatResource()
  const { user, isLoggedIn } = useAuth()

  const threads = ref<ChatThreadDTO[]>([])
  const activeThreadId = ref<number | null>(null)
  const messagesByThread = ref<Record<number, ChatMessageDTO[]>>({})
  const typingByThread = ref<Record<number, number[]>>({})
  const readStateByThread = ref<Record<number, { lastReadAt?: string }>>({})
  const draftByThread = ref<Record<number, string>>({})
  const pendingByThread = ref<Record<number, { streamId: string, messageId: number } | undefined>>({})
  const messageStatusByThread = ref<Record<number, ChatStatus>>({})
  const isLoadingThreads = ref(false)
  const isLoadingMessages = ref<Record<number, boolean>>({})
  const error = ref<string | null>(null)
  const drawerOpen = ref(false)
  const initialized = ref(false)
  const socketBound = ref(false)

  function sortThreads(items: ChatThreadDTO[]) {
    return [...items].sort((a, b) => {
      const aWeight = a.type === 'ai' ? 0 : 1
      const bWeight = b.type === 'ai' ? 0 : 1
      if (aWeight !== bWeight) return aWeight - bWeight
      return 0
    })
  }

  const unreadCount = computed(() => {
    const currentUserId = user.value?.id
    if (!currentUserId) return 0

    return threads.value.reduce((total, thread) => {
      const items = messagesByThread.value[thread.id] || []
      const lastRead = readStateByThread.value[thread.id]?.lastReadAt
      if (!lastRead) return total + items.filter(message => message.sender_id !== currentUserId).length

      const lastReadDate = new Date(lastRead)
      const unread = items.filter((message) => {
        if (message.sender_id === currentUserId) return false
        return new Date(message.created_at) > lastReadDate
      })
      return total + unread.length
    }, 0)
  })

  const activeThread = computed(() => threads.value.find(thread => thread.id === activeThreadId.value) || null)

  const activeMessages = computed(() => {
    if (!activeThreadId.value) return []
    return messagesByThread.value[activeThreadId.value] || []
  })

  const activeUiMessages = computed<UIMessage[]>(() => {
    return activeMessages.value.map(message => ({
      id: String(message.id),
      role: message.type === 'assistant' ? 'assistant' : message.type === 'system' ? 'system' : 'user',
      parts: [{ type: 'text', text: message.content }],
      content: message.content,
      createdAt: new Date(message.created_at)
    }) as UIMessage)
  })

  const activeTypingUsers = computed(() => {
    if (!activeThreadId.value) return []
    return typingByThread.value[activeThreadId.value] || []
  })

  const activeStatus = computed<ChatStatus>(() => {
    if (!activeThreadId.value) return 'ready'
    return messageStatusByThread.value[activeThreadId.value] || 'ready'
  })

  function getThreadMessages(threadId: number) {
    const items = messagesByThread.value[threadId]
    if (items) return items
    messagesByThread.value[threadId] = []
    return messagesByThread.value[threadId]!
  }

  function addMessage(threadId: number, message: ChatMessageDTO) {
    const items = getThreadMessages(threadId)
    if (items.find(item => item.id === message.id)) return
    items.push(message)
  }

  function removeMessage(threadId: number, messageId: number) {
    const items = getThreadMessages(threadId)
    const index = items.findIndex(item => item.id === messageId)
    if (index !== -1) items.splice(index, 1)
  }

  async function loadThreads() {
    if (!isLoggedIn.value) return
    isLoadingThreads.value = true
    error.value = null
    try {
      const data = await resource.listThreads()
      threads.value = sortThreads(data)
      if (!activeThreadId.value && data.length > 0) {
        const first = threads.value[0]
        if (first) setActiveThread(first.id)
      }
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac watkow'
    } finally {
      isLoadingThreads.value = false
    }
  }

  async function ensureAiThread() {
    if (!isLoggedIn.value) return null
    try {
      const result = await resource.ensureAiThread()
      return result.threadId
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie przygotowac watku AI'
      return null
    }
  }

  async function loadMessages(threadId: number, cursor?: string) {
    if (!isLoggedIn.value) return
    isLoadingMessages.value[threadId] = true
    try {
      const data = await resource.listMessages(threadId, cursor)
      messagesByThread.value[threadId] = data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac wiadomosci'
    } finally {
      isLoadingMessages.value[threadId] = false
    }
  }

  function bindSocket() {
    if (socketBound.value) return
    socketBound.value = true

    socket.onEvent((event) => {
      handleSocketEvent(event)
    })
  }

  function connect() {
    if (!isLoggedIn.value) return
    bindSocket()
    socket.connect()
  }

  function setActiveThread(threadId: number) {
    const previous = activeThreadId.value
    activeThreadId.value = threadId

    if (previous && previous !== threadId) {
      socket.send({ type: CHAT_EVENTS.THREAD_LEAVE, payload: { thread_id: previous } })
    }

    socket.send({ type: CHAT_EVENTS.THREAD_JOIN, payload: { thread_id: threadId } })

    if (!messagesByThread.value[threadId]) {
      void loadMessages(threadId)
    }

    updateRead(threadId)
  }

  function setDraft(threadId: number, value: string) {
    draftByThread.value[threadId] = value
  }

  function sendMessage(threadId: number, content: string) {
    if (!content.trim()) return
    const tempId = createTempId()
    const tempMessage: ChatMessageDTO = {
      id: createPendingId(),
      thread_id: threadId,
      sender_id: user.value?.id,
      type: 'user',
      content,
      metadata: { temp_id: tempId },
      created_at: new Date().toISOString()
    }

    addMessage(threadId, tempMessage)

    socket.send({
      type: CHAT_EVENTS.MESSAGE_SEND,
      payload: {
        thread_id: threadId,
        content,
        temp_id: tempId
      }
    })

    setDraft(threadId, '')
    messageStatusByThread.value[threadId] = 'submitted'
  }

  function applyIncomingMessage(payload: ChatMessageNewPayload) {
    const threadId = payload.thread_id
    const message = payload.message

    if (payload.temp_id) {
      const items = getThreadMessages(threadId)
      const tempIndex = items.findIndex(item => (item.metadata as { temp_id?: string } | undefined)?.temp_id === payload.temp_id)
      if (tempIndex !== -1) {
        items.splice(tempIndex, 1, message)
      } else {
        addMessage(threadId, message)
      }
    } else {
      addMessage(threadId, message)
    }

    if (message.type === 'assistant') {
      const pending = pendingByThread.value[threadId]
      if (pending) {
        removeMessage(threadId, pending.messageId)
        pendingByThread.value[threadId] = undefined
      }
      messageStatusByThread.value[threadId] = 'ready'
    } else {
      messageStatusByThread.value[threadId] = 'ready'
    }

    if (activeThreadId.value === threadId) {
      updateRead(threadId)
    }
  }

  function applyAiDelta(payload: ChatMessageDeltaPayload) {
    const threadId = payload.thread_id
    const pending = pendingByThread.value[threadId]
    if (!pending || pending.streamId !== payload.stream_id) {
      const pendingId = createPendingId()
      const pendingMessage: ChatMessageDTO = {
        id: pendingId,
        thread_id: threadId,
        sender_id: undefined,
        type: 'assistant',
        content: payload.delta,
        metadata: { pending: true, stream_id: payload.stream_id },
        created_at: new Date().toISOString()
      }
      addMessage(threadId, pendingMessage)
      pendingByThread.value[threadId] = { streamId: payload.stream_id, messageId: pendingId }
    } else {
      const items = getThreadMessages(threadId)
      const message = items.find(item => item.id === pending.messageId)
      if (message) {
        message.content += payload.delta
      }
    }

    messageStatusByThread.value[threadId] = 'streaming'
  }

  function applyReadUpdate(payload: ChatReadUpdatedPayload) {
    readStateByThread.value[payload.thread_id] = { lastReadAt: payload.last_read_at }
  }

  function applyTyping(threadId: number, userId: number, typing: boolean) {
    if (user.value?.id === userId) return
    const current = typingByThread.value[threadId] || []
    if (typing) {
      if (!current.includes(userId)) {
        typingByThread.value[threadId] = [...current, userId]
      }
    } else {
      typingByThread.value[threadId] = current.filter(id => id !== userId)
    }
  }

  function updateTyping(threadId: number, typing: boolean) {
    socket.send({
      type: CHAT_EVENTS.TYPING,
      payload: {
        thread_id: threadId,
        typing
      }
    })
  }

  function updateRead(threadId: number) {
    const lastReadAt = new Date().toISOString()
    socket.send({
      type: CHAT_EVENTS.READ_UPDATE,
      payload: {
        thread_id: threadId,
        last_read_at: lastReadAt
      }
    })
    readStateByThread.value[threadId] = { lastReadAt }
  }

  function handleSocketEvent(event: ChatSocketEnvelope) {
    if (!event.type) return

    switch (event.type) {
      case CHAT_EVENTS.MESSAGE_NEW:
        applyIncomingMessage(event.payload as ChatMessageNewPayload)
        break
      case CHAT_EVENTS.MESSAGE_DELTA:
        applyAiDelta(event.payload as ChatMessageDeltaPayload)
        break
      case CHAT_EVENTS.READ_UPDATED:
        applyReadUpdate(event.payload as ChatReadUpdatedPayload)
        break
      case CHAT_EVENTS.TYPING: {
        const payload = event.payload as { thread_id: number, user_id: number, typing: boolean }
        applyTyping(payload.thread_id, payload.user_id, payload.typing)
        break
      }
      case CHAT_EVENTS.ERROR: {
        const payload = event.payload as { message?: string }
        error.value = payload?.message || 'Wystapil blad czatu'
        if (activeThreadId.value) {
          messageStatusByThread.value[activeThreadId.value] = 'error'
        }
        break
      }
      default:
        break
    }
  }

  function openDrawer() {
    drawerOpen.value = true
  }

  function closeDrawer() {
    drawerOpen.value = false
  }

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value
  }

  function ensureInitialized() {
    if (initialized.value) return
    initialized.value = true
    connect()
    void (async () => {
      const ensuredThreadId = await ensureAiThread()
      await loadThreads()
      if (ensuredThreadId && !activeThreadId.value) {
        setActiveThread(ensuredThreadId)
      }
    })()
  }

  watch(
    () => socket.status.value,
    (next) => {
      if (next === 'open' && activeThreadId.value) {
        socket.send({ type: CHAT_EVENTS.THREAD_JOIN, payload: { thread_id: activeThreadId.value } })
      }
    }
  )

  return {
    threads,
    activeThreadId,
    activeThread,
    activeMessages,
    activeUiMessages,
    activeTypingUsers,
    activeStatus,
    messagesByThread,
    typingByThread,
    readStateByThread,
    draftByThread,
    unreadCount,
    isLoadingThreads,
    isLoadingMessages,
    error,
    drawerOpen,
    ensureInitialized,
    loadThreads,
    loadMessages,
    setActiveThread,
    setDraft,
    sendMessage,
    updateTyping,
    updateRead,
    openDrawer,
    closeDrawer,
    toggleDrawer
  }
})
