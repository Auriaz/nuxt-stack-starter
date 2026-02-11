<script lang="ts" setup>
import type { CalendarDate } from '@internationalized/date'
import { useEventListener } from '@vueuse/core'
import type { CalendarEventListItemDTO } from '#shared/types/calendar'
import type { TimeRange } from '~/composables/useCalendarSelection'

const props = defineProps<{
  effectiveDate: CalendarDate
  events: CalendarEventListItemDTO[]
  isLoading: boolean
  showWorkHoursOnly: boolean
  workdayStartHour: number
  workdayEndHour: number
  timeRange: TimeRange | null
  isSelectingTime: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh' | 'timeEnd'): void
  (e: 'edit' | 'cancel' | 'duplicate' | 'copyLink' | 'openChat' | 'moveScope', id: number): void
  (e: 'moveEvent' | 'resizeEvent', value: { id: number, start: Date, end: Date }): void
  (e: 'timeStart', value: { date: Date, shiftKey: boolean }): void
  (e: 'timeHover', value: Date): void
}>()

const hourHeight = 56
const openEventId = ref<number | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const resizingEvent = ref<{ id: number, start: Date, columnEl: HTMLElement } | null>(null)
const pendingResizeEnd = ref<Date | null>(null)

const minimumDurationMinutes = 30

function setOpen(id: number, open: boolean) {
  openEventId.value = open ? id : null
}

const days = computed(() => {
  const base = new Date(props.effectiveDate.year, props.effectiveDate.month - 1, props.effectiveDate.day)
  return Array.from({ length: 4 }, (_, index) => {
    const current = new Date(base)
    current.setDate(base.getDate() + index)
    return current
  })
})

const hourRange = computed(() => {
  const start = Math.max(0, Math.min(23, props.showWorkHoursOnly ? props.workdayStartHour : 0))
  let end = Math.max(1, Math.min(24, props.showWorkHoursOnly ? props.workdayEndHour : 24))
  if (end <= start) end = Math.min(24, start + 1)
  return { start, end }
})

const hours = computed(() => {
  const { start, end } = hourRange.value
  return Array.from({ length: end - start }, (_, index) => start + index)
})

const gridHeight = computed(() => hours.value.length * hourHeight)

function getEventsForDay(date: Date) {
  return props.events.filter((event) => {
    const start = new Date(event.start_at)
    return start.getFullYear() === date.getFullYear()
      && start.getMonth() === date.getMonth()
      && start.getDate() === date.getDate()
  })
}

function getEventStyle(event: CalendarEventListItemDTO) {
  const startDate = new Date(event.start_at)
  const endDate = new Date(event.end_at)
  const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
  const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
  const { start } = hourRange.value
  const offsetMinutes = Math.max(0, startMinutes - start * 60)
  const durationMinutes = Math.max(30, endMinutes - startMinutes)

  return {
    top: `${(offsetMinutes / 60) * hourHeight}px`,
    height: `${(durationMinutes / 60) * hourHeight}px`
  }
}

function getDurationMinutes(event: CalendarEventListItemDTO) {
  const start = new Date(event.start_at)
  const end = new Date(event.end_at)
  return Math.max(minimumDurationMinutes, Math.round((end.getTime() - start.getTime()) / 60000))
}

function getMinutesFromPointer(clientY: number, columnEl: HTMLElement) {
  const rect = columnEl.getBoundingClientRect()
  const y = Math.min(Math.max(clientY - rect.top, 0), rect.height)
  const minutesInView = hours.value.length * 60
  const snapped = Math.round((y / rect.height) * minutesInView / 15) * 15
  return hourRange.value.start * 60 + snapped
}

function handleDragStart(eventItem: CalendarEventListItemDTO, event: DragEvent) {
  const start = new Date(eventItem.start_at)
  const payload = {
    id: eventItem.id,
    durationMinutes: getDurationMinutes(eventItem),
    startMinutes: start.getMinutes()
  }
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(payload))
    event.dataTransfer.setData('text/plain', String(eventItem.id))
    event.dataTransfer.setDragImage(new Image(), 0, 0)
    event.dataTransfer.effectAllowed = 'move'
  }
  return
}

function handleDragEnd() {
  return
}

function handleDrop(day: Date, hour: number, event: DragEvent) {
  const raw = event.dataTransfer?.getData('application/json')
  if (!raw) return
  try {
    const payload = JSON.parse(raw) as { id: number, durationMinutes: number, startMinutes: number }
    const start = new Date(day)
    start.setHours(hour, Math.min(59, Math.max(0, payload.startMinutes ?? 0)), 0, 0)
    const end = new Date(start)
    end.setMinutes(start.getMinutes() + Math.max(minimumDurationMinutes, payload.durationMinutes || 0))
    emit('moveEvent', { id: payload.id, start, end })
  } catch {
    return
  }
}

function startResize(eventItem: CalendarEventListItemDTO, event: MouseEvent) {
  const columnEl = (event.currentTarget as HTMLElement | null)?.closest('[data-day-column]') as HTMLElement | null
  if (!columnEl) return
  resizingEvent.value = { id: eventItem.id, start: new Date(eventItem.start_at), columnEl }
  pendingResizeEnd.value = new Date(eventItem.end_at)
}

useEventListener(window, 'mousemove', (event: MouseEvent) => {
  if (!resizingEvent.value) return
  const minutes = getMinutesFromPointer(event.clientY, resizingEvent.value.columnEl)
  const end = new Date(resizingEvent.value.start)
  end.setHours(0, 0, 0, 0)
  end.setMinutes(minutes)
  const minEnd = new Date(resizingEvent.value.start)
  minEnd.setMinutes(minEnd.getMinutes() + minimumDurationMinutes)
  if (end.getTime() < minEnd.getTime()) {
    end.setTime(minEnd.getTime())
  }
  pendingResizeEnd.value = end
})

useEventListener(window, 'mouseup', () => {
  if (!resizingEvent.value) return
  if (pendingResizeEnd.value) {
    emit('resizeEvent', { id: resizingEvent.value.id, start: resizingEvent.value.start, end: pendingResizeEnd.value })
  }
  resizingEvent.value = null
  pendingResizeEnd.value = null
})

function isHourSelected(day: Date, hour: number) {
  if (!props.timeRange) return false
  const cellStart = new Date(day)
  cellStart.setHours(hour, 0, 0, 0)
  const cellEnd = new Date(day)
  cellEnd.setHours(hour + 1, 0, 0, 0)
  return cellStart.getTime() >= props.timeRange.start.getTime()
    && cellEnd.getTime() <= props.timeRange.end.getTime()
}

onMounted(async () => {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = (props.showWorkHoursOnly ? 0 : props.workdayStartHour * hourHeight)
  }
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm text-neutral-500">
          4 dni
        </p>
        <p class="text-lg font-semibold">
          {{ days[0]?.toLocaleDateString('pl-PL') }} - {{ days[days.length - 1]?.toLocaleDateString('pl-PL') }}
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

    <div class="rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div class="grid grid-cols-[80px_1fr]">
        <div class="border-r border-neutral-200 dark:border-neutral-800">
          <div class="h-12 border-b border-neutral-200 dark:border-neutral-800" />
          <div
            v-for="hour in hours"
            :key="hour"
            class="h-14 border-b border-neutral-200 px-2 text-xs text-neutral-500 dark:border-neutral-800"
          >
            {{ String(hour).padStart(2, '0') }}:00
          </div>
        </div>

        <div
          ref="scrollRef"
          class="overflow-auto"
          @mouseup="emit('timeEnd')"
        >
          <div
            class="grid border-b border-neutral-200 dark:border-neutral-800"
            :style="{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }"
          >
            <div
              v-for="day in days"
              :key="day.toISOString()"
              class="flex h-12 flex-col justify-center border-l border-neutral-200 px-2 text-xs font-medium dark:border-neutral-800"
            >
              <span class="text-neutral-500">{{ day.toLocaleDateString('pl-PL', { weekday: 'short' }) }}</span>
              <span>{{ day.getDate() }}.{{ String(day.getMonth() + 1).padStart(2, '0') }}</span>
            </div>
          </div>

          <div
            class="relative"
            :style="{ height: `${gridHeight}px` }"
          >
            <div
              v-for="(day, index) in days"
              :key="day.toISOString() + index"
              class="absolute top-0 bottom-0 border-l border-neutral-200 dark:border-neutral-800"
              data-day-column
              :style="{ left: `${(index / days.length) * 100}%`, width: `${100 / days.length}%` }"
            >
              <div
                v-for="hour in hours"
                :key="hour"
                class="border-b border-neutral-200 dark:border-neutral-800"
                :class="isHourSelected(day, hour) ? 'bg-primary-50/60 dark:bg-primary-500/10' : ''"
                :style="{ height: `${hourHeight}px` }"
                @mousedown.prevent="emit('timeStart', { date: new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0), shiftKey: $event.shiftKey })"
                @mouseenter="isSelectingTime ? emit('timeHover', new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 0, 0)) : null"
                @dragover.prevent
                @drop="handleDrop(day, hour, $event)"
              />

              <CalendarEventPopover
                v-for="event in getEventsForDay(day)"
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
                  class="absolute left-2 right-2 rounded-md bg-primary-500/10 px-2 py-1 text-left text-xs text-primary-800 hover:bg-primary-500/20 dark:text-primary-200"
                  :style="getEventStyle(event)"
                  draggable="true"
                  @dragstart="handleDragStart(event, $event)"
                  @dragend="handleDragEnd"
                  @click="setOpen(event.id, true)"
                >
                  <p class="truncate font-medium">
                    {{ event.title }}
                  </p>
                  <p class="text-[10px] text-primary-600 dark:text-primary-300">
                    {{ new Date(event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                  </p>
                  <span
                    class="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize"
                    @mousedown.prevent.stop="startResize(event, $event)"
                  />
                </button>
              </CalendarEventPopover>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
