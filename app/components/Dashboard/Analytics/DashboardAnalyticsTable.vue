<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { AnalyticsTopPageDTO, AnalyticsSourceDTO } from '#shared/types'

type Row = AnalyticsTopPageDTO | AnalyticsSourceDTO

const props = withDefaults(
  defineProps<{
    items?: Row[] | null
    loading?: boolean
    variant: 'pages' | 'sources'
  }>(),
  { items: () => [] }
)

const isEmpty = computed(() => !props.loading && (!props.items || props.items.length === 0))

const columnsPages: TableColumn<AnalyticsTopPageDTO>[] = [
  { accessorKey: 'path', header: 'Ścieżka', meta: { class: { td: 'font-mono text-sm max-w-[200px] truncate' } } },
  { accessorKey: 'title', header: 'Tytuł', cell: ({ row }) => row.original.title ?? '—' },
  { accessorKey: 'pageviews', header: 'Odsłony', meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } }, cell: ({ row }) => row.original.pageviews.toLocaleString('pl-PL') }
]

const columnsSources: TableColumn<AnalyticsSourceDTO>[] = [
  { accessorKey: 'channel', header: 'Kanał' },
  { accessorKey: 'sessions', header: 'Sesje', meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } }, cell: ({ row }) => row.original.sessions.toLocaleString('pl-PL') },
  { accessorKey: 'users', header: 'Użytkownicy', meta: { class: { th: 'text-right', td: 'text-right tabular-nums' } }, cell: ({ row }) => (row.original.users != null ? row.original.users.toLocaleString('pl-PL') : '—') }
]

const tableData = computed(() => props.items ?? [])
</script>

<template>
  <UCard class="glass-panel cockpit-panel relative overflow-hidden">
    <div class="cockpit-hud-corners" />
    <template #header>
      <h3 class="text-lg font-semibold">
        {{ variant === 'pages' ? 'Top strony' : 'Źródła ruchu' }}
      </h3>
    </template>
    <div
      v-if="loading"
      class="space-y-2"
    >
      <div
        v-for="i in 5"
        :key="i"
        class="h-10 animate-pulse rounded bg-default-200"
      />
    </div>
    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center gap-2 py-12 text-muted"
    >
      <UIcon
        :name="variant === 'pages' ? 'i-lucide-file-text' : 'i-lucide-globe'"
        class="size-12"
      />
      <p class="text-sm">
        Brak danych w wybranym okresie
      </p>
    </div>
    <UTable
      v-else-if="variant === 'pages'"
      :data="tableData as AnalyticsTopPageDTO[]"
      :columns="columnsPages"
    />
    <UTable
      v-else
      :data="tableData as AnalyticsSourceDTO[]"
      :columns="columnsSources"
    />
  </UCard>
</template>
