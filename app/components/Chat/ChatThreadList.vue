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

const filtered = computed(() => {
  if (!search.value.trim()) return props.threads
  const query = search.value.toLowerCase()
  return props.threads.filter(thread => (thread.title || '').toLowerCase().includes(query))
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
      v-else-if="filtered.length === 0"
      class="text-sm text-basic-500 dark:text-basic-400 py-6 text-center"
    >
      Brak watkow
    </div>

    <div
      v-else
      class="space-y-1"
    >
      <ChatThreadItem
        v-for="thread in filtered"
        :key="thread.id"
        :thread="thread"
        :active="thread.id === activeThreadId"
        :unread-count="unreadByThread?.[thread.id]"
        @click="emit('select', thread.id)"
      />
    </div>
  </UCard>
</template>
