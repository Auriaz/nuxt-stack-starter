<script lang="ts" setup>
import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date'
import type { CalendarEventListItemDTO } from '#shared/types/calendar'
import type { DayRange } from '~/composables/useCalendarSelection'

const props = defineProps<{
  yearMonths: Array<{ month: number, label: string }>
  selectedYear: number
  isLoading: boolean
  events: CalendarEventListItemDTO[]
  categoryColors: Record<number, string>
  dayRange: DayRange | null
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'openMonth', month: number): void
  (e: 'rangeChange', value: DayRange | null): void
}>()

function toDateKey(date: Date) {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const eventKeys = computed(() => {
  const set = new Set<string>()
  for (const event of props.events) {
    const date = new Date(event.start_at)
    set.add(toDateKey(date))
  }
  return set
})

const eventColorMap = computed(() => {
  const map = new Map<string, Set<string>>()
  for (const event of props.events) {
    if (!event.category_id) continue
    const color = props.categoryColors[event.category_id]
    if (!color) continue
    const date = new Date(event.start_at)
    const key = toDateKey(date)
    const bucket = map.get(key) ?? new Set<string>()
    bucket.add(color)
    map.set(key, bucket)
  }
  return map
})

function getDayDotColor(date: Date) {
  const colors = eventColorMap.value.get(toDateKey(date))
  if (!colors || colors.size !== 1) return null
  return [...colors][0]
}

const rangeValue = computed({
  get: () => props.dayRange ?? { start: undefined, end: undefined },
  set: (value: DayRange | null) => {
    if (!value || (!value.start && !value.end)) {
      emit('rangeChange', null)
      return
    }
    emit('rangeChange', value)
  }
})

function getMonthPlaceholder(month: number) {
  return new CalendarDate(props.selectedYear, month, 1)
}

function getDayMenuItems(day: DateValue) {
  return [
    [
      {
        label: 'Nowe wydarzenie',
        icon: 'i-lucide-plus',
        onClick: () => emit('rangeChange', { start: day, end: day })
      },
      {
        label: 'Otworz miesiac',
        icon: 'i-lucide-calendar-days',
        onClick: () => emit('openMonth', day.month)
      }
    ],
    [
      {
        label: 'Odswiez',
        icon: 'i-lucide-rotate-cw',
        onClick: () => emit('refresh')
      }
    ]
  ]
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-neutral-500">
          Rok
        </p>
        <p class="text-lg font-semibold">
          {{ selectedYear }}
        </p>
      </div>
      <UButton
        variant="outline"
        color="neutral"
        size="sm"
        icon="i-lucide-rotate-cw"
        :loading="isLoading"
        @click="emit('refresh')"
      >
        Odswiez
      </UButton>
    </div>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <UCard
        v-for="month in yearMonths"
        :key="month.month"
        class="space-y-2"
      >
        <div class="flex items-center justify-between">
          <p class="font-medium">
            {{ month.label }}
          </p>
          <UButton
            size="xs"
            variant="outline"
            color="neutral"
            @click="emit('openMonth', month.month)"
          >
            Otworz
          </UButton>
        </div>

        <UCalendar
          v-model:open="rangeValue"
          range
          size="sm"
          :month-controls="false"
          :year-controls="false"
          :week-starts-on="1"
          :fixed-weeks="true"
          :default-placeholder="getMonthPlaceholder(month.month)"
          :placeholder="getMonthPlaceholder(month.month)"
          class="rounded-md border border-neutral-200 p-2 dark:border-neutral-800"
        >
          <template #day="{ day }">
            <UContextMenu :items="getDayMenuItems(day)">
              <div class="relative flex items-center justify-center">
                <span>{{ day.day }}</span>
                <span
                  v-if="eventKeys.has(toDateKey(day.toDate(getLocalTimeZone())))"
                  class="absolute -bottom-1 h-1 w-1 rounded-full bg-primary-500"
                  :style="{ backgroundColor: getDayDotColor(day.toDate(getLocalTimeZone())) ?? undefined }"
                />
              </div>
            </UContextMenu>
          </template>
        </UCalendar>
      </UCard>
    </div>
  </div>
</template>
