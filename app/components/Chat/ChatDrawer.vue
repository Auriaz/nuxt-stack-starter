<script lang="ts" setup>
import { PERMISSIONS } from '#shared/permissions'
import { useChatStore } from '~/stores/chat'

const { isLoggedIn, can, user } = useAccess()
const chatStore = useChatStore()

const activeId = computed(() => chatStore.activeThreadId)

const canUseChat = computed(() => {
  if (!isLoggedIn.value) return false
  if (!Array.isArray(user.value?.permissions)) return true
  return can(PERMISSIONS.CHAT_USE)
})

const unreadByThread = computed(() => {
  const map: Record<number, number> = {}
  const currentUserId = user.value?.id
  if (!currentUserId) return map

  for (const thread of chatStore.threads) {
    const items = chatStore.messagesByThread?.[thread.id] || []
    const lastRead = chatStore.readStateByThread?.[thread.id]?.lastReadAt
    if (!lastRead) {
      map[thread.id] = items.filter(message => message.sender_id !== currentUserId).length
      continue
    }
    const lastReadDate = new Date(lastRead)
    map[thread.id] = items.filter(message => message.sender_id !== currentUserId && new Date(message.created_at) > lastReadDate).length
  }

  return map
})

watch(
  () => chatStore.drawerOpen,
  (open) => {
    if (open) chatStore.ensureInitialized()
  }
)
</script>

<template>
  <ClientOnly>
    <USlideover
      v-if="canUseChat"
      v-model:open="chatStore.drawerOpen"
    >
      <template #content>
        <div class="h-full p-4">
          <ChatShell stacked>
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
                :draft="activeId ? (chatStore.draftByThread[activeId] || '') : ''"
                :disabled="!activeId"
                @update:draft="(value) => activeId ? chatStore.setDraft(activeId, value) : null"
                @send="activeId ? chatStore.sendMessage(activeId, chatStore.draftByThread[activeId] || '') : null"
                @typing="(value) => activeId ? chatStore.updateTyping(activeId, value) : null"
              />
            </template>
          </ChatShell>
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>
