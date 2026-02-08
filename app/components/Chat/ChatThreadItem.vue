<script lang="ts" setup>
import type { ChatThreadDTO } from '#shared/types/chat'

defineProps<{
  thread: ChatThreadDTO
  active?: boolean
  unreadCount?: number
}>()

const typeLabels: Record<string, string> = {
  ai: 'AI',
  dm: 'DM',
  team: 'Zespol',
  room: 'Pokoj'
}

const typeColors: Record<string, 'primary' | 'neutral' | 'success' | 'warning'> = {
  ai: 'primary',
  dm: 'neutral',
  team: 'success',
  room: 'warning'
}

const typeIcons: Record<string, string> = {
  ai: 'i-lucide-sparkles',
  dm: 'i-lucide-user',
  team: 'i-lucide-users',
  room: 'i-lucide-hash'
}

function resolveTitle(thread: ChatThreadDTO) {
  if (thread.title) return thread.title
  if (thread.type === 'ai') return 'Asystent AI'
  if (thread.type === 'team') return 'Kanal zespolu'
  return 'Konwersacja'
}

function resolveMeta(thread: ChatThreadDTO) {
  const typeLabel = typeLabels[thread.type] || 'Inne'
  const timestamp = thread.last_message_at
    ? new Date(thread.last_message_at).toLocaleString()
    : 'Brak wiadomosci'
  return `${typeLabel} • ${timestamp}`
}
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left transition-colors"
    :class="active
      ? 'bg-primary-50/60 dark:bg-primary-900/30 ring-1 ring-primary-200 dark:ring-primary-800'
      : 'hover:bg-basic-50 dark:hover:bg-basic-800/30'"
  >
    <div class="min-w-0">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium text-basic-900 dark:text-basic-100 truncate">
          {{ resolveTitle(thread) }}
        </p>
        <UIcon
          v-if="unreadCount && unreadCount > 0"
          name="i-lucide-bell"
          class="h-3.5 w-3.5 text-warning-500"
        />
        <UBadge
          :label="typeLabels[thread.type] || 'Inne'"
          :color="typeColors[thread.type] || 'primary'"
          variant="soft"
          size="xs"
        />
        <UIcon
          :name="typeIcons[thread.type] || 'i-lucide-tag'"
          class="h-3.5 w-3.5 text-basic-500 dark:text-basic-400"
        />
      </div>
      <p class="text-xs text-basic-500 dark:text-basic-400">
        {{ resolveMeta(thread) }}
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
