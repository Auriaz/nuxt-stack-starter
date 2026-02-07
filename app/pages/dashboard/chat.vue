<script lang="ts" setup>
import { PERMISSIONS } from '#shared/permissions'
import { useChatStore } from '~/stores/chat'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.CHAT_USE,
  ssr: false
})

useSeoMeta({
  title: 'Czat - Dashboard',
  description: 'Czat z asystentem i uzytkownikami'
})

const chatStore = useChatStore()
const { user } = useAuth()
const route = useRoute()
const focusMessageId = computed(() => {
  const value = route.query.message
  return typeof value === 'string' && value ? value : null
})
const focusMessageAt = computed(() => {
  const value = route.query.message_at
  return typeof value === 'string' && value ? value : null
})
const activeId = computed(() => chatStore.activeThreadId)

const unreadByThread = computed(() => {
  const map: Record<number, number> = {}
  const currentUserId = user.value?.id
  if (!currentUserId) return map

  for (const thread of chatStore.threads) {
    const items = chatStore.messagesByThread[thread.id] || []
    const lastRead = chatStore.readStateByThread[thread.id]?.lastReadAt
    if (!lastRead) {
      map[thread.id] = items.filter(message => message.sender_id !== currentUserId).length
      continue
    }
    const lastReadDate = new Date(lastRead)
    map[thread.id] = items.filter(message => message.sender_id !== currentUserId && new Date(message.created_at) > lastReadDate).length
  }

  return map
})

const activeDraft = computed(() => {
  if (!chatStore.activeThreadId) return ''
  return chatStore.draftByThread[chatStore.activeThreadId] || ''
})

async function handleThreadQuery() {
  const threadId = Number(route.query.thread)
  if (!threadId) return
  chatStore.setActiveThread(threadId)
  if (focusMessageAt.value) {
    const parsed = new Date(focusMessageAt.value)
    if (!Number.isNaN(parsed.valueOf())) {
      parsed.setMilliseconds(parsed.getMilliseconds() + 1)
      await chatStore.loadMessages(threadId, parsed.toISOString())
    }
  }
}

onMounted(() => {
  chatStore.ensureInitialized()
  void handleThreadQuery()
})

watch(
  () => [route.query.thread, route.query.message_at],
  () => {
    void handleThreadQuery()
  }
)
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Czat"
      icon="i-lucide-message-square"
    >
      <template #body>
        <ChatShell>
          <template #threads>
            <ChatThreadList
              :threads="chatStore.threads"
              :active-thread-id="chatStore.activeThreadId"
              :loading="chatStore.isLoadingThreads"
              :unread-by-thread="unreadByThread"
              @select="chatStore.setActiveThread"
            />
          </template>
          <template #conversation>
            <ChatThreadView
              :thread-title="chatStore.activeThread?.title"
              :messages="chatStore.activeUiMessages"
              :status="chatStore.activeStatus"
              :typing-users="chatStore.activeTypingUsers"
              :loading="activeId ? chatStore.isLoadingMessages[activeId] : false"
              :error="chatStore.error"
              :draft="activeDraft"
              :disabled="!activeId"
              :focus-message-id="focusMessageId"
              @update:draft="(value) => activeId ? chatStore.setDraft(activeId, value) : null"
              @send="activeId ? chatStore.sendMessage(activeId, activeDraft) : null"
              @typing="(value) => activeId ? chatStore.updateTyping(activeId, value) : null"
            />
          </template>
        </ChatShell>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
