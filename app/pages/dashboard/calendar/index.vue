<script lang="ts" setup>
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { CreateCalendarEventInputSchema } from '#shared/schemas/calendar'
import type { CalendarEventDTO, CalendarEventListItemDTO, CreateCalendarEventInput } from '#shared/types/calendar'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useCalendarResource } from '~/composables/resources/useCalendarResource'
import { useTeamsResource } from '~/composables/resources/useTeamsResource'
import { useCalendarSocket } from '~/composables/useCalendarSocket'
import { useForm } from '~/composables/useForm'
import { useCalendarPreferences } from '~/composables/useCalendarPreferences'
import { useCalendarView, type CalendarViewMode } from '~/composables/useCalendarView'
import { useCalendarSelection, type DayRange } from '~/composables/useCalendarSelection'
import { PERMISSIONS } from '#shared/permissions'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Kalendarz - Dashboard',
  description: 'Kalendarz zespolowy i prywatny'
})

const { can, user } = useAccess()
const calendarResource = useCalendarResource()
const teamsResource = useTeamsResource()
const calendarSocket = useCalendarSocket()

const defaultTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
const today = new Date()

const { prefs, isLoading: prefsLoading, error: prefsError, load: loadPrefs, updatePrefs } = useCalendarPreferences()
const { viewMode, selectedDate } = useCalendarView({
  defaultView: computed(() => prefs.value.defaultView)
})

const selection = useCalendarSelection()

const dayRange = computed(() => selection.dayRange.value as DayRange | null ?? null)
const timeRange = computed(() => selection.timeRange.value ?? null)
const isSelectingDay = computed(() => selection.isSelectingDay.value)
const isSelectingTime = computed(() => selection.isSelectingTime.value)

const scope = computed({
  get: () => prefs.value.scope,
  set: (value: 'personal' | 'team' | 'all') => updatePrefs({ scope: value })
})

const teamId = computed({
  get: () => prefs.value.teamId,
  set: (value: number | undefined) => updatePrefs({ teamId: value })
})

const events = ref<CalendarEventListItemDTO[]>([])
const selectedEvent = ref<CalendarEventDTO | null>(null)
const teams = ref<Array<{ id: number, name: string }>>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isMoveToTeamOpen = ref(false)
const selectedEventForMove = ref<number | null>(null)

const form = useForm(CreateCalendarEventInputSchema, {
  initialValues: {
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    timezone: defaultTimeZone,
    visibility: 'private'
  }
})

const hasCalendarRead = computed(() => can(PERMISSIONS.CALENDAR_READ) || can(PERMISSIONS.CALENDAR_TEAM_READ))
const activeTimeZone = computed(() => prefs.value.timezone || defaultTimeZone)
const toast = useToast()

function getEffectiveDate(): CalendarDate {
  return selectedDate.value ?? new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

function setDateParts(parts: { year?: number, month?: number, day?: number }) {
  const current = getEffectiveDate()
  const nextYear = parts.year ?? current.year
  const nextMonth = parts.month ?? current.month
  const maxDay = daysInMonth(nextYear, nextMonth)
  const nextDay = Math.min(parts.day ?? current.day, maxDay)
  selectedDate.value = new CalendarDate(nextYear, nextMonth, nextDay)
}

function setSelectedDate(next: Date) {
  selectedDate.value = new CalendarDate(next.getFullYear(), next.getMonth() + 1, next.getDate())
}

function shiftDateByDays(days: number) {
  const current = getEffectiveDate()
  const next = new Date(current.year, current.month - 1, current.day)
  next.setDate(next.getDate() + days)
  setSelectedDate(next)
}

function shiftDateByMonths(months: number) {
  const current = getEffectiveDate()
  const next = new Date(current.year, current.month - 1, current.day)
  next.setMonth(next.getMonth() + months)
  setSelectedDate(next)
}

function shiftDateByYears(years: number) {
  const current = getEffectiveDate()
  const next = new Date(current.year, current.month - 1, current.day)
  next.setFullYear(next.getFullYear() + years)
  setSelectedDate(next)
}

const selectedYear = computed({
  get: () => getEffectiveDate().year,
  set: (value: number) => setDateParts({ year: value })
})

const selectedMonth = computed({
  get: () => getEffectiveDate().month,
  set: (value: number) => setDateParts({ month: value })
})

const selectedDay = computed({
  get: () => getEffectiveDate().day,
  set: (value: number) => setDateParts({ day: value })
})

const yearItems = computed(() => {
  const current = getEffectiveDate().year
  const start = current - 5
  const end = current + 5
  return Array.from({ length: end - start + 1 }, (_, index) => {
    const year = start + index
    return { label: String(year), value: year }
  })
})

const monthItems = computed(() => {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    return { label: String(month).padStart(2, '0'), value: month }
  })
})

const dayItems = computed(() => {
  const maxDay = daysInMonth(selectedYear.value, selectedMonth.value)
  return Array.from({ length: maxDay }, (_, index) => {
    const day = index + 1
    return { label: String(day).padStart(2, '0'), value: day }
  })
})

const effectiveDate = computed(() => getEffectiveDate())

function toMonthRange(date: CalendarDate) {
  const start = new CalendarDate(date.year, date.month, 1)
  const end = start.add({ months: 1 }).subtract({ days: 1 })
  const tz = getLocalTimeZone()
  return {
    from: start.toDate(tz).toISOString(),
    to: end.toDate(tz).toISOString()
  }
}

function toRangeForView(date: CalendarDate, mode: CalendarViewMode) {
  const tz = getLocalTimeZone()
  const base = new Date(date.year, date.month - 1, date.day)
  const start = new Date(base)
  const end = new Date(base)

  if (mode === 'day') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
  } else if (mode === 'week') {
    const day = base.getDay()
    const diff = day === 0 ? -6 : 1 - day
    start.setDate(base.getDate() + diff)
    start.setHours(0, 0, 0, 0)
    end.setTime(start.getTime())
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
  } else if (mode === 'four-day') {
    start.setHours(0, 0, 0, 0)
    end.setTime(start.getTime())
    end.setDate(start.getDate() + 3)
    end.setHours(23, 59, 59, 999)
  } else if (mode === 'schedule') {
    return toMonthRange(date)
  } else if (mode === 'year') {
    start.setMonth(0, 1)
    start.setHours(0, 0, 0, 0)
    end.setMonth(11, 31)
    end.setHours(23, 59, 59, 999)
  } else {
    return toMonthRange(date)
  }

  return {
    from: new Date(start.toLocaleString('en-US', { timeZone: tz })).toISOString(),
    to: new Date(end.toLocaleString('en-US', { timeZone: tz })).toISOString()
  }
}

function toLocalInputValue(value: string | undefined) {
  if (!value) return ''
  const date = new Date(value)
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function getDefaultStartEnd() {
  const now = new Date()
  const start = new Date(now)
  start.setMinutes(0, 0, 0)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)
  return {
    start: toLocalInputValue(start.toISOString()),
    end: toLocalInputValue(end.toISOString())
  }
}

const selectedDayEvents = computed(() => {
  const date = selectedDate.value
  if (!date) return []
  return visibleEvents.value.filter((event) => {
    const start = new Date(event.start_at)
    return start.getFullYear() === date.year
      && start.getMonth() + 1 === date.month
      && start.getDate() === date.day
  })
})

const yearMonths = computed(() => {
  const year = selectedYear.value
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1
    const label = new Date(year, index, 1).toLocaleString('pl-PL', { month: 'long' })
    return { month, label }
  })
})

const visibleEvents = computed(() => {
  return prefs.value.showCancelled ? events.value : events.value.filter(event => event.status !== 'cancelled')
})

async function loadTeams() {
  try {
    const data = await teamsResource.listTeams()
    teams.value = data.teams.map(team => ({ id: team.id, name: team.name }))
  } catch {
    teams.value = []
  }
}

async function loadEvents() {
  if (!hasCalendarRead.value) {
    events.value = []
    return
  }

  if (scope.value === 'team' && !teamId.value) {
    events.value = []
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const range = toRangeForView(getEffectiveDate(), viewMode.value)
    const data = await calendarResource.listEvents({
      from: range.from,
      to: range.to,
      scope: scope.value,
      teamId: teamId.value
    })
    events.value = data.items
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac wydarzen'
  } finally {
    isLoading.value = false
  }
}

function openCreateModal() {
  const defaults = getDefaultStartEnd()
  form.reset()
  form.setValues({
    title: '',
    description: '',
    start_at: defaults.start,
    end_at: defaults.end,
    timezone: activeTimeZone.value,
    visibility: scope.value === 'team' ? 'team' : 'private',
    team_id: scope.value === 'team' ? teamId.value ?? undefined : undefined
  })
  isCreateOpen.value = true
}

function openCreateModalWithRange(start: Date, end: Date) {
  form.reset()
  form.setValues({
    title: '',
    description: '',
    start_at: toLocalInputValue(start.toISOString()),
    end_at: toLocalInputValue(end.toISOString()),
    timezone: activeTimeZone.value,
    visibility: scope.value === 'team' ? 'team' : 'private',
    team_id: scope.value === 'team' ? teamId.value ?? undefined : undefined
  })
  isCreateOpen.value = true
}

function calendarDateToDate(date: { year: number, month: number, day: number }, hour = 9) {
  return new Date(date.year, date.month - 1, date.day, hour, 0, 0)
}

function handleDayRangeComplete(range: DayRange | null) {
  if (!range?.start || !range?.end) return
  const sameDay = range.start.year === range.end.year
    && range.start.month === range.end.month
    && range.start.day === range.end.day
  const start = calendarDateToDate(range.start, 9)
  const end = sameDay ? calendarDateToDate(range.end, 10) : calendarDateToDate(range.end, 17)
  openCreateModalWithRange(start, end)
  selection.clearSelection()
}

function handleDayRangeChange(range: DayRange | null) {
  selection.setDayRange(range)
  handleDayRangeComplete(range)
}

function handleTimeRangeComplete(range: { start: Date, end: Date } | null) {
  if (!range) return
  openCreateModalWithRange(range.start, range.end)
  selection.clearSelection()
}

function finalizeDaySelection() {
  handleDayRangeComplete(selection.endDaySelection() as DayRange | null)
}

async function openEditModal(eventId: number) {
  try {
    const event = await calendarResource.getEvent(eventId)

    // Sprawdź uprawnienia do edycji
    const isOwner = user.value?.id === event.owner_id
    const isAdmin = can(PERMISSIONS.CALENDAR_ADMIN)
    const canEditTeamEvent = event.team_id ? can(PERMISSIONS.CALENDAR_TEAM_WRITE) : false

    if (!isOwner && !isAdmin && !canEditTeamEvent) {
      toast.add({
        title: 'Brak uprawnień',
        description: 'Nie masz uprawnień do edycji tego wydarzenia',
        color: 'error'
      })
      return
    }

    selectedEvent.value = event
    form.reset()
    form.setValues({
      title: event.title,
      description: event.description ?? '',
      start_at: toLocalInputValue(event.start_at),
      end_at: toLocalInputValue(event.end_at),
      timezone: event.timezone,
      visibility: event.visibility,
      team_id: event.team_id ?? undefined,
      location: event.location ?? undefined,
      url: event.url ?? undefined
    })
    isEditOpen.value = true
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'statusCode' in err && err.statusCode === 403) {
      toast.add({
        title: 'Brak uprawnień',
        description: 'Nie masz uprawnień do przeglądania tego wydarzenia',
        color: 'error'
      })
    } else {
      toast.add({
        title: 'Błąd',
        description: err instanceof Error ? err.message : 'Nie udało się pobrać wydarzenia',
        color: 'error'
      })
    }
  }
}

function normalizeInput(values: CreateCalendarEventInput): CreateCalendarEventInput {
  const reminder = typeof values.reminder_minutes === 'number'
    ? values.reminder_minutes
    : values.reminder_minutes ? Number(values.reminder_minutes) : undefined
  const team = typeof values.team_id === 'number'
    ? values.team_id
    : values.team_id ? Number(values.team_id) : undefined
  return {
    ...values,
    reminder_minutes: Number.isFinite(reminder) ? reminder : undefined,
    team_id: Number.isFinite(team) ? team : undefined
  }
}

async function submitCreate(values: CreateCalendarEventInput) {
  try {
    const normalized = normalizeInput(values)
    await calendarResource.createEvent({
      ...normalized,
      team_id: scope.value === 'team' ? teamId.value ?? undefined : normalized.team_id
    })
    isCreateOpen.value = false
    await loadEvents()
  } catch (err: unknown) {
    form.setErrorsFromApi(err)
  }
}

async function submitUpdate(values: CreateCalendarEventInput) {
  if (!selectedEvent.value) return
  try {
    const normalized = normalizeInput(values)
    await calendarResource.updateEvent(selectedEvent.value.id, {
      ...normalized,
      team_id: scope.value === 'team' ? teamId.value ?? undefined : normalized.team_id
    })
    isEditOpen.value = false
    selectedEvent.value = null
    await loadEvents()
  } catch (err: unknown) {
    form.setErrorsFromApi(err)
  }
}

function submitCreateManual() {
  const handler = form.handleSubmit(submitCreate)
  return handler({ data: form.values.value } as FormSubmitEvent<CreateCalendarEventInput>)
}

function submitUpdateManual() {
  const handler = form.handleSubmit(submitUpdate)
  return handler({ data: form.values.value } as FormSubmitEvent<CreateCalendarEventInput>)
}

function handleCreateKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'TEXTAREA') return
  event.preventDefault()
  submitCreateManual()
}

function handleEditKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement
  if (target.tagName === 'TEXTAREA') return
  event.preventDefault()
  submitUpdateManual()
}

async function cancelEvent(eventId: number) {
  try {
    const event = await calendarResource.getEvent(eventId)

    // Sprawdź uprawnienia do anulowania
    const isOwner = user.value?.id === event.owner_id
    const isAdmin = can(PERMISSIONS.CALENDAR_ADMIN)
    const canEditTeamEvent = event.team_id ? can(PERMISSIONS.CALENDAR_TEAM_WRITE) : false

    if (!isOwner && !isAdmin && !canEditTeamEvent) {
      toast.add({
        title: 'Brak uprawnień',
        description: 'Nie masz uprawnień do anulowania tego wydarzenia',
        color: 'error'
      })
      return
    }

    await calendarResource.updateStatus(eventId, { status: 'cancelled' })
    await loadEvents()
    toast.add({
      title: 'Anulowano',
      description: 'Wydarzenie zostało anulowane',
      color: 'success'
    })
  } catch (err: unknown) {
    toast.add({
      title: 'Błąd',
      description: err instanceof Error ? err.message : 'Nie udało się anulować wydarzenia',
      color: 'error'
    })
  }
}

async function duplicateEvent(eventId: number) {
  try {
    const event = await calendarResource.getEvent(eventId)
    const duplicated: CreateCalendarEventInput = {
      title: `${event.title} (kopia)`,
      description: event.description ?? '',
      start_at: event.start_at,
      end_at: event.end_at,
      timezone: event.timezone,
      visibility: event.visibility,
      team_id: event.team_id ?? undefined,
      location: event.location ?? undefined,
      url: event.url ?? undefined
    }
    await calendarResource.createEvent(duplicated)
    await loadEvents()
    toast.add({
      title: 'Zduplikowano',
      description: 'Wydarzenie zostalo zduplikowane.',
      color: 'success'
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udalo sie zduplikowac wydarzenia'
    toast.add({
      title: 'Blad',
      description: message,
      color: 'error'
    })
  }
}

async function copyEventLink(eventId: number) {
  try {
    const baseUrl = window.location.origin
    const eventUrl = `${baseUrl}/dashboard/calendar?event=${eventId}`
    await navigator.clipboard.writeText(eventUrl)
    toast.add({
      title: 'Skopiowano',
      description: 'Link do wydarzenia zostal skopiowany do schowka.',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Blad',
      description: 'Nie udalo sie skopiowac linku.',
      color: 'error'
    })
  }
}

async function openMoveToTeamModal(eventId: number) {
  try {
    const event = await calendarResource.getEvent(eventId)

    // Sprawdź uprawnienia do przenoszenia
    const isOwner = user.value?.id === event.owner_id
    const isAdmin = can(PERMISSIONS.CALENDAR_ADMIN)
    const canEditTeamEvent = event.team_id ? can(PERMISSIONS.CALENDAR_TEAM_WRITE) : false

    if (!isOwner && !isAdmin && !canEditTeamEvent) {
      toast.add({
        title: 'Brak uprawnień',
        description: 'Nie masz uprawnień do przenoszenia tego wydarzenia',
        color: 'error'
      })
      return
    }

    selectedEventForMove.value = eventId
    isMoveToTeamOpen.value = true
  } catch (err: unknown) {
    toast.add({
      title: 'Błąd',
      description: err instanceof Error ? err.message : 'Nie udało się pobrać wydarzenia',
      color: 'error'
    })
  }
}

async function moveEventToTeam(targetTeamId: number | null, visibility: 'private' | 'team') {
  if (!selectedEventForMove.value) return

  try {
    await calendarResource.updateEvent(selectedEventForMove.value, {
      team_id: targetTeamId ?? undefined,
      visibility
    })
    await loadEvents()
    isMoveToTeamOpen.value = false
    selectedEventForMove.value = null
    toast.add({
      title: 'Przeniesiono',
      description: `Wydarzenie zostalo przeniesione do ${targetTeamId ? 'zespolu' : 'prywatnych'}.`,
      color: 'success'
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udalo sie przeniesc wydarzenia'
    toast.add({
      title: 'Blad',
      description: message,
      color: 'error'
    })
  }
}

async function openEventChat(eventId: number) {
  try {
    const response = await $fetch<{ thread_id: number }>(`/api/calendar/events/${eventId}/chat-thread`, {
      method: 'POST'
    })

    if (response.thread_id) {
      await navigateTo(`/dashboard/chat?thread=${response.thread_id}`)
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udało się otworzyć czatu'
    toast.add({
      title: 'Błąd',
      description: message,
      color: 'error'
    })
  }
}

async function updateEventTiming(payload: { id: number, start: Date, end: Date }, actionLabel: string) {
  try {
    await calendarResource.updateEvent(payload.id, {
      start_at: payload.start.toISOString(),
      end_at: payload.end.toISOString()
    })
    await loadEvents()
    toast.add({ title: 'Zapisano', description: actionLabel, color: 'success' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udalo sie zapisac zmian.'
    toast.add({ title: 'Blad', description: message, color: 'error' })
  }
}

function handleMoveEvent(payload: { id: number, start: Date, end: Date }) {
  return updateEventTiming(payload, 'Wydarzenie zostalo przeniesione.')
}

function handleResizeEvent(payload: { id: number, start: Date, end: Date }) {
  return updateEventTiming(payload, 'Czas wydarzenia zostal zaktualizowany.')
}

function setupSocket() {
  calendarSocket.connect()
  const stop = calendarSocket.onEvent(() => {
    loadEvents()
  })
  return () => {
    stop()
  }
}

watch([selectedDate, scope, teamId, viewMode], () => {
  loadEvents()
})

watch(scope, (nextScope) => {
  if (nextScope !== 'team' && teamId.value !== undefined) {
    updatePrefs({ teamId: undefined })
  }
})

let stopSocket: (() => void) | null = null
let keydownHandler: ((event: KeyboardEvent) => void) | null = null

function isEditableTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  if (el.isContentEditable) return true
  return Boolean(el.closest('input, textarea, select, [contenteditable="true"]'))
}

onMounted(() => {
  loadTeams()
  loadPrefs()
  loadEvents()
  stopSocket = setupSocket()

  keydownHandler = (event: KeyboardEvent) => {
    if (isEditableTarget(event.target)) return

    if (event.key === 'Escape') {
      selection.clearSelection()
      return
    }

    if (event.key === 't' || event.key === 'T') {
      setSelectedDate(today)
      event.preventDefault()
      return
    }

    const daysByView: Record<CalendarViewMode, number> = {
      'day': 1,
      'week': 7,
      'four-day': 4,
      'month': 30,
      'schedule': 30,
      'year': 365
    }

    let handled = false

    if (event.key === 'ArrowLeft') {
      shiftDateByDays(-1)
      handled = true
    } else if (event.key === 'ArrowRight') {
      shiftDateByDays(1)
      handled = true
    } else if (event.key === 'ArrowUp') {
      shiftDateByDays(-7)
      handled = true
    } else if (event.key === 'ArrowDown') {
      shiftDateByDays(7)
      handled = true
    } else if (event.key === 'PageUp') {
      if (viewMode.value === 'year') {
        shiftDateByYears(-1)
      } else if (viewMode.value === 'month' || viewMode.value === 'schedule') {
        shiftDateByMonths(-1)
      } else {
        shiftDateByDays(-daysByView[viewMode.value])
      }
      handled = true
    } else if (event.key === 'PageDown') {
      if (viewMode.value === 'year') {
        shiftDateByYears(1)
      } else if (viewMode.value === 'month' || viewMode.value === 'schedule') {
        shiftDateByMonths(1)
      } else {
        shiftDateByDays(daysByView[viewMode.value])
      }
      handled = true
    }

    if (handled) event.preventDefault()
  }
  window.addEventListener('keydown', keydownHandler)
})

onBeforeUnmount(() => {
  stopSocket?.()
  calendarSocket.disconnect()
  stopSocket = null
  if (keydownHandler) {
    window.removeEventListener('keydown', keydownHandler)
    keydownHandler = null
  }
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Kalendarz"
      icon="i-lucide-calendar-days"
    >
      <template #body>
        <div class="space-y-4">
          <CalendarTabs v-model="viewMode" />

          <CalendarToolbar
            v-model:selected-year="selectedYear"
            v-model:selected-month="selectedMonth"
            v-model:selected-day="selectedDay"
            :year-items="yearItems"
            :month-items="monthItems"
            :day-items="dayItems"
            @create="openCreateModal"
          />
        </div>

        <UAlert
          v-if="!hasCalendarRead"
          color="warning"
          variant="soft"
          title="Brak dostepu"
          description="Nie masz uprawnien do przegladania kalendarza."
        />

        <UAlert
          v-else-if="error"
          color="error"
          variant="soft"
          title="Blad"
          :description="error"
        />

        <div v-else>
          <CalendarViewsMonth
            v-if="viewMode === 'month'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :is-loading="isLoading"
            :show-weekends="prefs.showWeekends"
            :day-range="dayRange"
            :is-selecting-day="isSelectingDay"
            @refresh="loadEvents"
            @select-date="setDateParts"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @open-chat="openEventChat"
            @move-scope="openMoveToTeamModal"
            @day-start="selection.startDaySelection($event.date, $event.shiftKey)"
            @day-hover="selection.updateDaySelection($event)"
            @day-end="finalizeDaySelection"
          />

          <CalendarViewsWeek
            v-else-if="viewMode === 'week'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :is-loading="isLoading"
            :show-weekends="prefs.showWeekends"
            :show-work-hours-only="prefs.showWorkHoursOnly"
            :workday-start-hour="prefs.workdayStartHour"
            :workday-end-hour="prefs.workdayEndHour"
            :time-range="timeRange"
            :is-selecting-time="isSelectingTime"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @open-chat="openEventChat"
            @move-scope="openMoveToTeamModal"
            @move-event="handleMoveEvent"
            @resize-event="handleResizeEvent"
            @time-start="selection.startTimeSelection($event.date, $event.shiftKey)"
            @time-hover="selection.updateTimeSelection($event)"
            @time-end="handleTimeRangeComplete(selection.endTimeSelection())"
          />

          <CalendarViewsYear
            v-else-if="viewMode === 'year'"
            :selected-year="selectedYear"
            :year-months="yearMonths"
            :is-loading="isLoading"
            :events="visibleEvents"
            :day-range="dayRange"
            @refresh="loadEvents"
            @open-month="(month: number) => setDateParts({ month, day: 1 })"
            @range-change="handleDayRangeChange($event)"
          />

          <CalendarViewsSchedule
            v-else-if="viewMode === 'schedule'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :is-loading="isLoading"
            :show-weekends="prefs.showWeekends"
            :day-range="dayRange"
            :is-selecting-day="isSelectingDay"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @open-chat="openEventChat"
            @move-scope="openMoveToTeamModal"
            @day-start="selection.startDaySelection($event.date, $event.shiftKey)"
            @day-hover="selection.updateDaySelection($event)"
            @day-end="finalizeDaySelection"
          />

          <CalendarViewsFourDay
            v-else-if="viewMode === 'four-day'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :is-loading="isLoading"
            :show-work-hours-only="prefs.showWorkHoursOnly"
            :workday-start-hour="prefs.workdayStartHour"
            :workday-end-hour="prefs.workdayEndHour"
            :time-range="timeRange"
            :is-selecting-time="isSelectingTime"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @open-chat="openEventChat"
            @move-scope="openMoveToTeamModal"
            @move-event="handleMoveEvent"
            @resize-event="handleResizeEvent"
            @time-start="selection.startTimeSelection($event.date, $event.shiftKey)"
            @time-hover="selection.updateTimeSelection($event)"
            @time-end="handleTimeRangeComplete(selection.endTimeSelection())"
          />

          <CalendarViewsDay
            v-else
            :effective-date="effectiveDate"
            :events="selectedDayEvents"
            :is-loading="isLoading"
            :show-work-hours-only="prefs.showWorkHoursOnly"
            :workday-start-hour="prefs.workdayStartHour"
            :workday-end-hour="prefs.workdayEndHour"
            :time-range="timeRange"
            :is-selecting-time="isSelectingTime"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @open-chat="openEventChat"
            @move-scope="openMoveToTeamModal"
            @move-event="handleMoveEvent"
            @resize-event="handleResizeEvent"
            @time-start="selection.startTimeSelection($event.date, $event.shiftKey)"
            @time-hover="selection.updateTimeSelection($event)"
            @time-end="handleTimeRangeComplete(selection.endTimeSelection())"
          />
        </div>

        <UModal
          v-model:open="isCreateOpen"
          title="Nowe wydarzenie"
        >
          <template #body>
            <UCard @keydown.enter="handleCreateKeydown">
              <UForm
                :schema="CreateCalendarEventInputSchema"
                :state="form.values.value"
                @submit="form.handleSubmit(submitCreate)"
              >
                <div class="grid gap-4">
                  <UFormField
                    label="Tytul"
                    name="title"
                    :error="form.errors.value?.title"
                    class="w-full"
                  >
                    <UInput
                      v-model="form.values.value.title"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Opis"
                    name="description"
                    :error="form.errors.value?.description"
                    class="w-full"
                  >
                    <UTextarea
                      v-model="form.values.value.description"
                      class="w-full"
                    />
                  </UFormField>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                      label="Start"
                      name="start_at"
                      :error="form.errors.value?.start_at"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.start_at"
                        type="datetime-local"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Koniec"
                      name="end_at"
                      :error="form.errors.value?.end_at"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.end_at"
                        type="datetime-local"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                      label="Strefa czasowa"
                      name="timezone"
                      :error="form.errors.value?.timezone"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.timezone"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Widocznosc"
                      name="visibility"
                      :error="form.errors.value?.visibility"
                      class="w-full"
                    >
                      <USelect
                        v-model="form.values.value.visibility"
                        :items="[
                          { label: 'Prywatne', value: 'private' },
                          { label: 'Zespol', value: 'team' }
                        ]"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                      label="Lokalizacja"
                      name="location"
                      :error="form.errors.value?.location"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.location"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="URL"
                      name="url"
                      :error="form.errors.value?.url"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.url"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <UFormField
                    label="Przypomnienie (min)"
                    name="reminder_minutes"
                    :error="form.errors.value?.reminder_minutes"
                    class="w-full"
                  >
                    <UInput
                      :model-value="form.values.value.reminder_minutes"
                      type="number"
                      class="w-full"
                      @update:model-value="form.setField('reminder_minutes', $event === null ? undefined : Number($event))"
                    />
                  </UFormField>

                  <UAlert
                    v-if="form.formError.value"
                    color="error"
                    variant="soft"
                    :title="form.formError.value"
                    class="w-full"
                  />
                </div>
              </UForm>
            </UCard>
          </template>

          <template #footer>
            <div class="w-full flex justify-end gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="isCreateOpen = false"
              >
                Anuluj
              </UButton>
              <UButton
                color="primary"
                type="button"
                :loading="form.pending.value"
                @click="submitCreateManual"
              >
                Zapisz
              </UButton>
            </div>
          </template>
        </UModal>

        <UModal
          v-model:open="isEditOpen"
          :title="selectedEvent ? `Edytuj: ${selectedEvent.title}` : 'Edytuj wydarzenie'"
        >
          <template #body>
            <UCard @keydown.enter="handleEditKeydown">
              <UForm
                :schema="CreateCalendarEventInputSchema"
                :state="form.values.value"
                @submit="form.handleSubmit(submitUpdate)"
              >
                <div class="grid gap-4">
                  <UFormField
                    label="Tytul"
                    name="title"
                    :error="form.errors.value?.title"
                    class="w-full"
                  >
                    <UInput
                      v-model="form.values.value.title"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Opis"
                    name="description"
                    :error="form.errors.value?.description"
                    class="w-full"
                  >
                    <UTextarea
                      v-model="form.values.value.description"
                      class="w-full"
                    />
                  </UFormField>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                      label="Start"
                      name="start_at"
                      :error="form.errors.value?.start_at"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.start_at"
                        type="datetime-local"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Koniec"
                      name="end_at"
                      :error="form.errors.value?.end_at"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.end_at"
                        type="datetime-local"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                      label="Strefa czasowa"
                      name="timezone"
                      :error="form.errors.value?.timezone"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.timezone"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="Widocznosc"
                      name="visibility"
                      :error="form.errors.value?.visibility"
                      class="w-full"
                    >
                      <USelect
                        v-model="form.values.value.visibility"
                        :items="[
                          { label: 'Prywatne', value: 'private' },
                          { label: 'Zespol', value: 'team' }
                        ]"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UFormField
                      label="Lokalizacja"
                      name="location"
                      :error="form.errors.value?.location"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.location"
                        class="w-full"
                      />
                    </UFormField>
                    <UFormField
                      label="URL"
                      name="url"
                      :error="form.errors.value?.url"
                      class="w-full"
                    >
                      <UInput
                        v-model="form.values.value.url"
                        class="w-full"
                      />
                    </UFormField>
                  </div>

                  <UFormField
                    label="Reminder (min)"
                    name="reminder_minutes"
                    :error="form.errors.value?.reminder_minutes"
                    class="w-full"
                  >
                    <UInput
                      :model-value="form.values.value.reminder_minutes"
                      type="number"
                      class="w-full"
                      @update:model-value="form.setField('reminder_minutes', $event === null ? undefined : Number($event))"
                    />
                  </UFormField>
                </div>
              </UForm>
            </UCard>
          </template>
          <template #footer>
            <div class="w-full flex justify-end gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="isEditOpen = false"
              >
                Zamknij
              </UButton>
              <UButton
                color="primary"
                type="button"
                :loading="form.pending.value"
                @click="submitUpdateManual"
              >
                Zapisz zmiany
              </UButton>
            </div>
          </template>
        </UModal>

        <UModal
          v-model:open="isMoveToTeamOpen"
          title="Przenieś wydarzenie"
        >
          <template #body>
            <UCard>
              <div class="space-y-4">
                <p class="text-sm text-neutral-600 dark:text-neutral-400">
                  Wybierz docelowy zespół lub przenieś do wydarzeń prywatnych.
                </p>

                <div class="space-y-2">
                  <UButton
                    variant="outline"
                    color="neutral"
                    block
                    @click="moveEventToTeam(null, 'private')"
                  >
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-user" />
                      <span>Prywatne</span>
                    </div>
                  </UButton>

                  <UButton
                    v-for="team in teams"
                    :key="team.id"
                    variant="outline"
                    color="neutral"
                    block
                    @click="moveEventToTeam(team.id, 'team')"
                  >
                    <div class="flex items-center gap-2">
                      <UIcon name="i-lucide-users" />
                      <span>{{ team.name }}</span>
                    </div>
                  </UButton>
                </div>
              </div>
            </UCard>
          </template>

          <template #footer>
            <div class="w-full flex justify-end">
              <UButton
                variant="ghost"
                color="neutral"
                @click="isMoveToTeamOpen = false"
              >
                Anuluj
              </UButton>
            </div>
          </template>
        </UModal>
      </template>

      <template #sidebar>
        <CalendarQuickSettings
          :preferences="prefs"
          :teams="teams"
          :is-loading="prefsLoading"
          :error="prefsError"
          @update:preferences="updatePrefs"
        />
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
