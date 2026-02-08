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

const unreadByThread = computed(() => chatStore.unreadByThread)

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
                :thread-type="chatStore.activeThread?.type"
                :current-user-id="user?.id"
                :current-user-name="user?.name || user?.username"
                :current-user-avatar-url="user?.avatarUrl"
                :participants="activeId ? chatStore.participantsByThread[activeId] : undefined"
                :raw-messages="chatStore.activeMessages"
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
