import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import type { UIMessage, ChatStatus } from 'ai'
import type {
  ChatThreadDTO,
  ChatMessageDTO,
  ChatMessageNewPayload,
  ChatMessageDeltaPayload,
  ChatReadUpdatedPayload,
  ChatSocketEnvelope,
  ChatParticipantWithUserDTO
} from '#shared/types/chat'
import { CHAT_EVENTS } from '~/composables/chatEvents'
import { useChatSocket } from '~/composables/useChatSocket'
import { useChatResource } from '~/composables/resources/useChatResource'
import { useAuth } from '~/composables/useAuth'
import { useNotifications } from '~/composables/useNotifications'
import { PERMISSIONS } from '#shared/permissions'

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
  const notifications = useNotifications()

  const threads = ref<ChatThreadDTO[]>([])
  const activeThreadId = ref<number | null>(null)
  const messagesByThread = ref<Record<number, ChatMessageDTO[]>>({})
  const typingByThread = ref<Record<number, number[]>>({})
  const readStateByThread = ref<Record<number, { lastReadAt?: string }>>({})
  const draftByThread = ref<Record<number, string>>({})
  const participantsByThread = ref<Record<number, ChatParticipantWithUserDTO[]>>({})
  const unreadByThread = ref<Record<number, number>>({})
  const pendingByThread = ref<Record<number, { streamId: string, messageId: number } | undefined>>({})
  const messageStatusByThread = ref<Record<number, ChatStatus>>({})
  const isLoadingThreads = ref(false)
  const isLoadingMessages = ref<Record<number, boolean>>({})
  const error = ref<string | null>(null)
  const drawerOpen = ref(false)
  const initialized = ref(false)
  const socketBound = ref(false)
  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  function sortThreads(items: ChatThreadDTO[]) {
    return [...items].sort((a, b) => {
      const aWeight = a.type === 'ai' ? 0 : 1
      const bWeight = b.type === 'ai' ? 0 : 1
      if (aWeight !== bWeight) return aWeight - bWeight
      const aTime = new Date(a.last_message_at || a.created_at).getTime()
      const bTime = new Date(b.last_message_at || b.created_at).getTime()
      return bTime - aTime
    })
  }

  function upsertThread(thread: ChatThreadDTO) {
    const index = threads.value.findIndex(item => item.id === thread.id)
    if (index >= 0) {
      threads.value[index] = { ...threads.value[index], ...thread }
      threads.value = sortThreads(threads.value)
      return
    }
    threads.value = sortThreads([...threads.value, thread])
  }

  function scheduleThreadsRefresh() {
    if (refreshTimer) return
    refreshTimer = setTimeout(async () => {
      refreshTimer = null
      await loadThreads()
    }, 250)
  }

  function updateThreadLastMessage(threadId: number, lastMessageAt: string) {
    const index = threads.value.findIndex(item => item.id === threadId)
    if (index === -1) {
      scheduleThreadsRefresh()
      return
    }
    const item = threads.value[index]
    if (!item) return
    item.last_message_at = lastMessageAt
    threads.value = sortThreads(threads.value)
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
      createdAt: new Date(message.created_at),
      senderId: message.sender_id
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

  async function loadThreads(options?: { activateFirst?: boolean }) {
    if (!isLoggedIn.value) return
    isLoadingThreads.value = true
    error.value = null
    try {
      const data = await resource.listThreads()
      threads.value = sortThreads(data)
      const activateFirst = options?.activateFirst !== false
      if (activateFirst && !activeThreadId.value && data.length > 0) {
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
    if (Array.isArray(user.value?.permissions) && !user.value?.permissions?.includes(PERMISSIONS.CHAT_AI_USE)) {
      return null
    }
    try {
      const result = await resource.ensureAiThread()
      return result.threadId
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'statusCode' in err && (err as { statusCode?: number }).statusCode === 403) {
        return null
      }
      error.value = err instanceof Error ? err.message : 'Nie udalo sie przygotowac watku AI'
      return null
    }
  }

  async function openDmThread(otherUserId: number) {
    if (!isLoggedIn.value) return null
    try {
      const thread = await resource.openDm(otherUserId)
      upsertThread(thread)
      setActiveThread(thread.id)
      return thread
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie otworzyc DM'
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

  async function loadParticipants(threadId: number) {
    if (!isLoggedIn.value) return
    try {
      const data = await resource.listParticipants(threadId)
      participantsByThread.value[threadId] = data
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac uczestnikow'
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

    notifications.clearLocalByAction(`/dashboard/chat?thread=${threadId}`)

    if (previous && previous !== threadId) {
      socket.send({ type: CHAT_EVENTS.THREAD_LEAVE, payload: { thread_id: previous } })
    }

    socket.send({ type: CHAT_EVENTS.THREAD_JOIN, payload: { thread_id: threadId } })

    if (!messagesByThread.value[threadId]) {
      void loadMessages(threadId)
    }

    if (!participantsByThread.value[threadId]) {
      void loadParticipants(threadId)
    }

    updateRead(threadId)
    unreadByThread.value[threadId] = 0
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

    updateThreadLastMessage(threadId, message.created_at)

    const currentUserId = user.value?.id
    const isOwn = currentUserId && message.sender_id === currentUserId
    const isActive = activeThreadId.value === threadId
    if (!isOwn && !isActive) {
      unreadByThread.value[threadId] = (unreadByThread.value[threadId] || 0) + 1
      const thread = threads.value.find(item => item.id === threadId)
      if (thread?.type === 'ai' || message.type === 'assistant') {
        return
      }
      const title = thread?.type === 'team'
        ? `Nowa wiadomosc w zespole: ${thread.title || 'Kanal zespolu'}`
        : thread?.type === 'dm'
          ? 'Nowa wiadomosc w DM'
          : 'Nowa wiadomosc'
      const rawPreview = typeof message.content === 'string' ? message.content : ''
      const preview = rawPreview.trim().slice(0, 140)
      const channelLabel = thread?.title || (thread?.type === 'team' ? 'Kanal zespolu' : thread?.type === 'dm' ? 'Nowy DM' : 'Czat')
      const notificationMessage = preview ? `${channelLabel} • ${preview}` : `${channelLabel} • Brak tresci`
      notifications.addLocalNotification({
        title,
        message: notificationMessage,
        actionUrl: `/dashboard/chat?thread=${threadId}`,
        type: 'info'
      })
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
    unreadByThread.value[threadId] = 0
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

  function ensureRealtime() {
    if (!isLoggedIn.value) return
    if (!socketBound.value) {
      bindSocket()
    }
    connect()
    void loadThreads({ activateFirst: false })
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
    participantsByThread,
    unreadByThread,
    unreadCount,
    isLoadingThreads,
    isLoadingMessages,
    error,
    drawerOpen,
    ensureInitialized,
    ensureRealtime,
    loadThreads,
    loadMessages,
    openDmThread,
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
