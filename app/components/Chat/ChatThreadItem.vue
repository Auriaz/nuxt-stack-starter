<script lang="ts" setup>
import type { ChatThreadDTO } from '#shared/types/chat'

defineProps<{
  thread: ChatThreadDTO
  active?: boolean
  unreadCount?: number
}>()
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors"
    :class="active ? 'bg-basic-100 dark:bg-basic-800/60' : 'hover:bg-basic-50 dark:hover:bg-basic-800/30'"
  >
    <div class="min-w-0">
      <p class="text-sm font-medium text-basic-900 dark:text-basic-100 truncate">
        {{ thread.title || (thread.type === 'ai' ? 'Asystent AI' : 'Konwersacja') }}
      </p>
      <p class="text-xs text-basic-500 dark:text-basic-400">
        {{ thread.last_message_at ? new Date(thread.last_message_at).toLocaleString() : 'Brak wiadomosci' }}
      </p>
    </div>
    <UBadge
      v-if="unreadCount && unreadCount > 0"
      :label="unreadCount > 99 ? '99+' : unreadCount.toString()"
      color="primary"
      variant="solid"
      size="xs"
    />
  </button>
</template>
