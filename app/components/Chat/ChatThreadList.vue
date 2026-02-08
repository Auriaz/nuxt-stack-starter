<script lang="ts" setup>
import type { ChatThreadDTO } from '#shared/types/chat'

const props = defineProps<{
  threads: ChatThreadDTO[]
  activeThreadId: number | null
  loading?: boolean
  unreadByThread?: Record<number, number>
}>()

const emit = defineEmits<{
  (event: 'select', threadId: number): void
}>()

const search = ref('')

const typeLabels: Record<string, string> = {
  ai: 'AI',
  dm: 'DM',
  team: 'Zespoly',
  room: 'Pokoje'
}

function getSearchText(thread: ChatThreadDTO) {
  const label = typeLabels[thread.type] || 'Inne'
  return `${thread.title || ''} ${label}`.toLowerCase()
}

const filtered = computed(() => {
  if (!search.value.trim()) return props.threads
  const query = search.value.toLowerCase()
  return props.threads.filter(thread => getSearchText(thread).includes(query))
})

const grouped = computed(() => {
  const ai: ChatThreadDTO[] = []
  const dm: ChatThreadDTO[] = []
  const team: ChatThreadDTO[] = []
  const room: ChatThreadDTO[] = []
  const other: ChatThreadDTO[] = []

  for (const thread of filtered.value) {
    if (thread.type === 'ai') ai.push(thread)
    else if (thread.type === 'dm') dm.push(thread)
    else if (thread.type === 'team') team.push(thread)
    else if (thread.type === 'room') room.push(thread)
    else other.push(thread)
  }

  const groups: Array<{ key: string, label: string, items: ChatThreadDTO[] }> = [
    { key: 'ai', label: 'Asystent AI', items: ai },
    { key: 'dm', label: 'Wiadomosci', items: dm },
    { key: 'team', label: 'Zespoly', items: team },
    { key: 'room', label: 'Pokoje', items: room.concat(other) }
  ]

  return groups.filter(group => group.items.length > 0)
})
</script>

<template>
  <UCard
    class="h-full"
    :ui="{ body: 'p-4 space-y-4 h-full' }"
  >
    <div class="flex items-center gap-2">
      <UIcon
        name="i-lucide-search"
        class="h-4 w-4 text-basic-500"
      />
      <UInput
        v-model="search"
        placeholder="Szukaj watkow"
        size="sm"
        class="flex-1"
      />
    </div>

    <div
      v-if="loading"
      class="space-y-3"
    >
      <USkeleton
        v-for="item in 5"
        :key="item"
        class="h-10"
      />
    </div>

    <div
      v-else-if="grouped.length === 0"
      class="text-sm text-basic-500 dark:text-basic-400 py-6 text-center"
    >
      Brak watkow
    </div>

    <div
      v-else
      class="space-y-4"
    >
      <div
        v-for="group in grouped"
        :key="group.key"
        class="space-y-1"
      >
        <p class="text-xs font-semibold uppercase text-basic-500 dark:text-basic-400">
          {{ group.label }}
        </p>
        <ChatThreadItem
          v-for="thread in group.items"
          :key="thread.id"
          :thread="thread"
          :active="thread.id === activeThreadId"
          :unread-count="unreadByThread?.[thread.id]"
          @click="emit('select', thread.id)"
        />
      </div>
    </div>
  </UCard>
</template>
