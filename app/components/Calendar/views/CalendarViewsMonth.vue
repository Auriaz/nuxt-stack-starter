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
  (e: 'selectDate', value: { year: number, month: number, day: number }): void
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

const todayKey = toDateKey(new Date())

const dayLabels = computed(() => {
  const labels = ['Pon', 'Wt', 'Sr', 'Czw', 'Pt', 'Sob', 'Ndz']
  return props.showWeekends ? labels : labels.slice(0, 5)
})

const weeks = computed(() => {
  const year = props.effectiveDate.year
  const month = props.effectiveDate.month
  const firstDay = new Date(year, month - 1, 1)
  const mondayIndex = (firstDay.getDay() + 6) % 7
  const start = new Date(year, month - 1, 1 - mondayIndex)

  const result: Array<Array<{ date: Date, inMonth: boolean }>> = []
  for (let week = 0; week < 6; week++) {
    const days: Array<{ date: Date, inMonth: boolean }> = []
    for (let day = 0; day < 7; day++) {
      const current = new Date(start)
      current.setDate(start.getDate() + week * 7 + day)
      days.push({
        date: current,
        inMonth: current.getMonth() === month - 1
      })
    }
    result.push(props.showWeekends ? days : days.filter(item => ![0, 6].includes(item.date.getDay())))
  }
  return result
})

const eventMap = computed(() => {
  const map = new Map<string, CalendarEventListItemDTO[]>()
  for (const event of props.events) {
    const date = new Date(event.start_at)
    const key = toDateKey(date)
    const bucket = map.get(key) ?? []
    bucket.push(event)
    map.set(key, bucket)
  }
  return map
})

function getEvents(date: Date) {
  return eventMap.value.get(toDateKey(date)) ?? []
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
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-neutral-500">
          Miesiac
        </p>
        <p class="text-lg font-semibold">
          {{ new Date(effectiveDate.year, effectiveDate.month - 1, 1).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' }) }}
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
      class="grid gap-px rounded-lg bg-neutral-200 dark:bg-neutral-800"
      :class="showWeekends ? 'grid-cols-7' : 'grid-cols-5'"
    >
      <div
        v-for="i in (showWeekends ? 42 : 30)"
        :key="i"
        class="h-28 animate-pulse bg-neutral-100 dark:bg-neutral-900"
      />
    </div>

    <div
      v-else
      class="space-y-1"
    >
      <div
        class="grid gap-px text-xs font-medium uppercase tracking-wide text-neutral-500"
        :class="showWeekends ? 'grid-cols-7' : 'grid-cols-5'"
      >
        <div
          v-for="label in dayLabels"
          :key="label"
          class="px-3 py-2"
        >
          {{ label }}
        </div>
      </div>

      <div
        class="grid gap-px rounded-lg bg-neutral-200 dark:bg-neutral-800"
        :class="showWeekends ? 'grid-cols-7' : 'grid-cols-5'"
      >
        <div
          v-for="(week, weekIndex) in weeks"
          :key="weekIndex"
          class="contents"
        >
          <div
            v-for="day in week"
            :key="day.date.toISOString()"
            class="min-h-36 bg-white p-2 transition hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            :class="isInRange(day.date) ? 'ring-1 ring-primary-300 bg-primary-50/60 dark:bg-primary-500/10' : ''"
            @mouseup="emit('dayEnd')"
            @mouseenter="isSelectingDay ? emit('dayHover', toCalendarDate(day.date)) : null"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between text-xs font-semibold"
              :class="day.inMonth ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-400'"
              @click="emit('selectDate', { year: day.date.getFullYear(), month: day.date.getMonth() + 1, day: day.date.getDate() })"
              @mousedown.prevent="emit('dayStart', { date: toCalendarDate(day.date), shiftKey: $event.shiftKey })"
            >
              <span>{{ day.date.getDate() }}</span>
              <span
                v-if="toDateKey(day.date) === todayKey"
                class="rounded-full bg-primary-500 px-2 py-0.5 text-[10px] text-white"
              >
                Dzis
              </span>
            </button>

            <div class="mt-2 space-y-1">
              <template v-for="(event, index) in getEvents(day.date)">
                <CalendarEventPopover
                  v-if="index < 3"
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
                    class="w-full truncate rounded-md bg-primary-50 px-2 py-1 text-left text-xs text-primary-700 hover:bg-primary-100 dark:bg-primary-500/10 dark:text-primary-200"
                    @click="setOpen(event.id, true)"
                  >
                    {{ event.title }}
                  </button>
                </CalendarEventPopover>
              </template>
              <p
                v-if="getEvents(day.date).length > 3"
                class="text-[11px] text-neutral-500"
              >
                +{{ getEvents(day.date).length - 3 }} more
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
