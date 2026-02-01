<script lang="ts" setup>
import { CalendarDate } from '@internationalized/date'

const props = defineProps<{
  dateFrom: string
  dateTo: string
  period: '7d' | '30d'
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:dateFrom': [value: string]
  'update:dateTo': [value: string]
  'update:period': [value: '7d' | '30d']
  'apply': []
}>()

function parseDateString(s: string): CalendarDate {
  if (!s || s.length < 10) {
    const to = new Date()
    const from = new Date(to)
    from.setDate(from.getDate() - 29)
    return new CalendarDate(from.getFullYear(), from.getMonth() + 1, from.getDate())
  }
  const parts = s.slice(0, 10).split('-').map(Number)
  const y = parts[0] ?? 2000
  const m = parts[1] ?? 1
  const d = parts[2] ?? 1
  return new CalendarDate(y, m, d)
}

function formatCalendarDate(d: CalendarDate): string {
  const y = d.year
  const m = String(d.month).padStart(2, '0')
  const day = String(d.day).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getDefaultRange(): { start: CalendarDate, end: CalendarDate } {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
  return {
    start: new CalendarDate(from.getFullYear(), from.getMonth() + 1, from.getDate()),
    end: new CalendarDate(to.getFullYear(), to.getMonth() + 1, to.getDate())
  }
}

const dateRangeValue = computed({
  get: () => {
    const start = props.dateFrom ? parseDateString(props.dateFrom) : getDefaultRange().start
    const end = props.dateTo ? parseDateString(props.dateTo) : getDefaultRange().end
    return { start, end }
  },
  set: (value: { start: CalendarDate, end: CalendarDate } | null) => {
    if (!value?.start || !value?.end) return
    emit('update:dateFrom', formatCalendarDate(value.start))
    emit('update:dateTo', formatCalendarDate(value.end))
    emit('apply')
  }
})

/** Tekst zakresu dat do wyświetlenia (np. 15.01.2025 – 31.01.2025) */
const dateRangeLabel = computed(() => {
  if (!props.dateFrom || !props.dateTo) return 'Wybierz zakres'
  const fmt = (s: string) => {
    const [y, m, d] = s.split('-')
    return `${d}.${m}.${y}`
  }
  return `${fmt(props.dateFrom)} – ${fmt(props.dateTo)}`
})

function setPreset(p: '7d' | '30d') {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - (p === '7d' ? 6 : 29))
  emit('update:dateFrom', from.toISOString().slice(0, 10))
  emit('update:dateTo', to.toISOString().slice(0, 10))
  emit('update:period', p)
  emit('apply')
}
</script>

<template>
  <div class="w-full space-y-5 p-4">
    <div class="space-y-2">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Szybki wybór
      </p>
      <div class="grid grid-cols-2 gap-2">
        <UButton
          size="sm"
          :color="period === '7d' ? 'primary' : 'neutral'"
          variant="soft"
          :disabled="loading"
          class="min-w-0"
          @click="setPreset('7d')"
        >
          7 dni
        </UButton>
        <UButton
          size="sm"
          :color="period === '30d' ? 'primary' : 'neutral'"
          variant="soft"
          :disabled="loading"
          class="min-w-0"
          @click="setPreset('30d')"
        >
          30 dni
        </UButton>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        Zakres dat
      </p>
      <UPopover>
        <UButton
          color="neutral"
          variant="outline"
          size="sm"
          icon="i-lucide-calendar-days"
          :disabled="loading"
          class="w-full justify-start font-normal text-muted"
          block
        >
          <span class="truncate">{{ dateRangeLabel }}</span>
        </UButton>
        <template #content>
          <UCalendar
            v-model="dateRangeValue"
            range
            :number-of-months="2"
            size="sm"
            :disabled="loading"
            class="p-3"
          />
        </template>
      </UPopover>
    </div>

    <UButton
      size="sm"
      color="primary"
      :loading="loading"
      class="w-full flex items-center justify-center"
      @click="emit('apply')"
    >
      Zastosuj
    </UButton>
  </div>
</template>
