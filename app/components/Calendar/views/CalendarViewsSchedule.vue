<script lang="ts" setup>
import { CalendarDate } from '@internationalized/date'
import type { CalendarEventListItemDTO } from '#shared/types/calendar'
import type { DayRange } from '~/composables/useCalendarSelection'

const props = defineProps<{
  effectiveDate: CalendarDate
  events: CalendarEventListItemDTO[]
  isLoading: boolean
  showWeekends: boolean
  dayRange: DayRange | null
  isSelectingDay: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh' | 'dayEnd'): void
  (e: 'edit' | 'cancel' | 'duplicate' | 'copyLink' | 'openChat' | 'moveScope', id: number): void
  (e: 'dayStart', value: { date: CalendarDate, shiftKey: boolean }): void
  (e: 'dayHover', value: CalendarDate): void
}>()

const openEventId = ref<number | null>(null)

function setOpen(id: number, open: boolean) {
  openEventId.value = open ? id : null
}

function toDateKey(date: Date) {
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function toCalendarDate(date: Date) {
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

function isInRange(date: Date) {
  if (!props.dayRange?.start || !props.dayRange?.end) return false
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
  const start = new Date(props.dayRange.start.year, props.dayRange.start.month - 1, props.dayRange.start.day).getTime()
  const end = new Date(props.dayRange.end.year, props.dayRange.end.month - 1, props.dayRange.end.day).getTime()
  return target >= Math.min(start, end) && target <= Math.max(start, end)
}

const groups = computed(() => {
  const grouped = new Map<string, CalendarEventListItemDTO[]>()
  const sorted = [...props.events].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())

  for (const event of sorted) {
    const date = new Date(event.start_at)
    if (!props.showWeekends && [0, 6].includes(date.getDay())) continue
    const key = toDateKey(date)
    const bucket = grouped.get(key) ?? []
    bucket.push(event)
    grouped.set(key, bucket)
  }

  return Array.from(grouped.entries()).map(([key, items]) => ({
    key,
    items,
    label: items[0]
      ? new Date(items[0].start_at).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })
      : key
  }))
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-neutral-500">
          Harmonogram
        </p>
        <p class="text-lg font-semibold">
          {{ new Date(effectiveDate.year, effectiveDate.month - 1, effectiveDate.day).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }) }}
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

    <div
      v-if="isLoading"
      class="space-y-3"
    >
      <UCard
        v-for="i in 4"
        :key="i"
        variant="soft"
        class="space-y-2"
      >
        <USkeleton class="h-4 w-48" />
        <USkeleton class="h-10 w-full" />
        <USkeleton class="h-10 w-full" />
      </UCard>
    </div>

    <div
      v-else-if="groups.length === 0"
      class="text-sm text-neutral-500"
    >
      Brak wydarzen w wybranym zakresie.
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <div
        v-for="group in groups"
        :key="group.key"
        class="space-y-3"
      >
        <div
          class="sticky top-0 z-10 rounded-md bg-neutral-100 px-3 py-2 text-sm font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
          :class="isInRange(new Date(group.key)) ? 'ring-1 ring-primary-300' : ''"
          @mousedown.prevent="emit('dayStart', { date: toCalendarDate(new Date(group.key)), shiftKey: $event.shiftKey })"
          @mouseenter="isSelectingDay ? emit('dayHover', toCalendarDate(new Date(group.key))) : null"
          @mouseup="emit('dayEnd')"
        >
          {{ group.label }}
        </div>

        <div class="space-y-2">
          <CalendarEventPopover
            v-for="event in group.items"
            :key="event.id"
            :event="event"
            :open="openEventId === event.id"
            @update:open="setOpen(event.id, $event)"
            @edit="emit('edit', $event)"
            @cancel="emit('cancel', $event)"
            @duplicate="emit('duplicate', $event)"
            @copy-link="emit('copyLink', $event)"
            @open-chat="emit('openChat', $event)"
            @move-scope="emit('moveScope', $event)"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-4 py-3 text-left text-sm shadow-sm hover:border-primary-300 dark:border-neutral-800 dark:bg-neutral-900"
              @click="setOpen(event.id, true)"
            >
              <span class="font-medium">{{ event.title }}</span>
              <span class="text-xs text-neutral-500">
                {{ new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }} -
                {{ new Date(event.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </button>
          </CalendarEventPopover>
        </div>
      </div>
    </div>
  </div>
</template>
