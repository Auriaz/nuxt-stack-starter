import type { DateValue, AnyCalendarDate } from '@internationalized/date'

export type DayRange = { start?: DateValue, end?: DateValue }
export type TimeRange = { start: Date, end: Date }

function normalizeDayRange(start: AnyCalendarDate, end: AnyCalendarDate): DayRange {
  const startValue = new Date(start.year, start.month - 1, start.day).getTime()
  const endValue = new Date(end.year, end.month - 1, end.day).getTime()
  return startValue <= endValue
    ? { start: start as DateValue, end: end as DateValue }
    : { start: end as DateValue, end: start as DateValue }
}

function normalizeTimeRange(start: Date, end: Date): TimeRange {
  return start.getTime() <= end.getTime() ? { start, end } : { start: end, end: start }
}

function addHour(date: Date) {
  const next = new Date(date)
  next.setHours(next.getHours() + 1)
  return next
}

export function useCalendarSelection() {
  const dayRange = ref<DayRange | null>(null)
  const timeRange = ref<TimeRange | null>(null)

  const isSelectingDay = ref(false)
  const isSelectingTime = ref(false)

  const dayAnchor = ref<DateValue | null>(null)
  const timeAnchor = ref<Date | null>(null)

  function startDaySelection(date: DateValue, shiftKey = false) {
    if (shiftKey && dayAnchor.value) {
      const anchor = dayAnchor.value
      dayRange.value = normalizeDayRange(anchor, date)
      isSelectingDay.value = false
      return
    }
    dayAnchor.value = date
    dayRange.value = { start: date, end: date }
    isSelectingDay.value = true
  }

  function updateDaySelection(date: DateValue) {
    if (!isSelectingDay.value || !dayAnchor.value) return
    const anchor = dayAnchor.value
    dayRange.value = normalizeDayRange(anchor, date)
  }

  function endDaySelection() {
    isSelectingDay.value = false
    return dayRange.value
  }

  function setDayRange(range: DayRange | null) {
    dayRange.value = range
    isSelectingDay.value = false
  }

  function startTimeSelection(date: Date, shiftKey = false) {
    if (shiftKey && timeAnchor.value) {
      timeRange.value = normalizeTimeRange(timeAnchor.value, addHour(date))
      isSelectingTime.value = false
      return
    }
    timeAnchor.value = date
    timeRange.value = { start: date, end: addHour(date) }
    isSelectingTime.value = true
  }

  function updateTimeSelection(date: Date) {
    if (!isSelectingTime.value || !timeAnchor.value) return
    timeRange.value = normalizeTimeRange(timeAnchor.value, addHour(date))
  }

  function endTimeSelection() {
    isSelectingTime.value = false
    return timeRange.value
  }

  function clearSelection() {
    dayRange.value = null
    timeRange.value = null
    isSelectingDay.value = false
    isSelectingTime.value = false
  }

  return {
    dayRange,
    timeRange,
    isSelectingDay,
    isSelectingTime,
    startDaySelection,
    updateDaySelection,
    endDaySelection,
    setDayRange,
    startTimeSelection,
    updateTimeSelection,
    endTimeSelection,
    clearSelection
  }
}
