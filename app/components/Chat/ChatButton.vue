<script lang="ts" setup>
import { PERMISSIONS } from '#shared/permissions'
import { useChatStore } from '~/stores/chat'

const { isLoggedIn, can, user } = useAccess()

const chatStore = useChatStore()

const canUseChat = computed(() => {
  if (!isLoggedIn.value) return false
  if (!Array.isArray(user.value?.permissions)) return true
  return can(PERMISSIONS.CHAT_USE)
})

const label = computed(() => {
  const count = chatStore.unreadCount
  if (!count) return 'Czat'
  return `Czat (${count})`
})
</script>

<template>
  <UButton
    v-if="canUseChat"
    variant="ghost"
    color="neutral"
    size="sm"
    square
    class="relative"
    :aria-label="label"
    @click="chatStore.toggleDrawer"
  >
    <UIcon
      name="i-lucide-message-square"
      class="h-5 w-5 text-basic-600 dark:text-basic-400"
    />
    <UBadge
      v-if="chatStore.unreadCount > 0"
      :label="chatStore.unreadCount > 99 ? '99+' : chatStore.unreadCount.toString()"
      color="primary"
      variant="solid"
      class="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-1 text-xs font-semibold"
    />
  </UButton>
</template>
