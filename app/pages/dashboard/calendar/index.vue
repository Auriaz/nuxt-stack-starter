<script lang="ts" setup>
import { CalendarDate, getLocalTimeZone } from '@internationalized/date'
import { CreateCalendarEventInputSchema } from '#shared/schemas/calendar'
import type { CalendarEventDTO, CalendarEventListItemDTO, CreateCalendarEventInput } from '#shared/types/calendar'
import type { EventCategoryDTO } from '#shared/types/event-category'
import type { TeamMemberDTO } from '#shared/types/teams'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useCalendarResource } from '~/composables/resources/useCalendarResource'
import { useTeamsResource } from '~/composables/resources/useTeamsResource'
import { useEventCategoriesResource } from '~/composables/resources/useEventCategoriesResource'
import { useCalendarSocket } from '~/composables/useCalendarSocket'
import { useForm } from '~/composables/useForm'
import { useCalendarPreferences } from '~/composables/useCalendarPreferences'
import { useCalendarView, type CalendarViewMode } from '~/composables/useCalendarView'
import { useCalendarSelection, type DayRange } from '~/composables/useCalendarSelection'
import { PERMISSIONS } from '#shared/permissions'
import { useChatStore } from '~/stores/chat'

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
const categoriesResource = useEventCategoriesResource()
const calendarSocket = useCalendarSocket()
const chatStore = useChatStore()

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
const teamMembers = ref<TeamMemberDTO[]>([])
const categories = ref<EventCategoryDTO[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)
const teamRole = ref<'owner' | 'admin' | 'member' | null>(null)

const isCreateOpen = ref(false)
const isEditOpen = ref(false)
const isMoveToTeamOpen = ref(false)
const selectedEventForMove = ref<number | null>(null)
const isCancelConfirmOpen = ref(false)
const selectedEventForCancel = ref<number | null>(null)

const form = useForm(CreateCalendarEventInputSchema, {
  initialValues: {
    title: '',
    description: '',
    start_at: '',
    end_at: '',
    timezone: defaultTimeZone,
    visibility: 'private',
    category_id: undefined
  }
})

const hasCalendarRead = computed(() => can(PERMISSIONS.CALENDAR_READ) || can(PERMISSIONS.CALENDAR_TEAM_READ))
const canMoveTeamEvents = computed(() =>
  can(PERMISSIONS.CALENDAR_ADMIN)
  || teamRole.value === 'owner'
  || teamRole.value === 'admin'
)
const activeTimeZone = computed(() => prefs.value.timezone || defaultTimeZone)
const toast = useToast()

const categoryColors = computed<Record<number, string>>(() => {
  return Object.fromEntries(categories.value.map(category => [category.id, category.color]))
})
const teamNameMap = computed<Record<number, string>>(() => {
  return Object.fromEntries(teams.value.map(team => [team.id, team.name]))
})
const teamMemberPreview = computed(() => teamMembers.value.map(member => ({
  id: member.user_id,
  name: member.user?.name ?? member.user?.username ?? `Uzytkownik #${member.user_id}`,
  role: member.role,
  avatarUrl: member.user?.avatar_url ?? undefined
})))

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

async function loadTeamRole() {
  if (!teamId.value) {
    teamRole.value = null
    return
  }

  try {
    const data = await teamsResource.listMembers(teamId.value)
    const member = data.members.find(item => item.user_id === user.value?.id)
    teamRole.value = member?.role ?? null
  } catch {
    teamRole.value = null
  }
}

async function loadTeamMembers() {
  if (!teamId.value) {
    teamMembers.value = []
    return
  }

  try {
    const data = await teamsResource.listMembers(teamId.value)
    teamMembers.value = data.members
  } catch {
    teamMembers.value = []
  }
}

async function loadCategories() {
  try {
    const data = await categoriesResource.listCategories({
      scope: 'all',
      teamId: teamId.value
    })
    categories.value = Array.isArray(data) ? data : []
  } catch {
    categories.value = []
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
    team_id: scope.value === 'team' ? teamId.value ?? undefined : undefined,
    category_id: undefined
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
    team_id: scope.value === 'team' ? teamId.value ?? undefined : undefined,
    category_id: undefined
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
      category_id: event.category_id ?? undefined,
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
  const category = typeof values.category_id === 'number'
    ? values.category_id
    : values.category_id ? Number(values.category_id) : undefined
  return {
    ...values,
    reminder_minutes: Number.isFinite(reminder) ? reminder : undefined,
    team_id: Number.isFinite(team) ? team : undefined,
    category_id: Number.isFinite(category) ? category : undefined
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

function requestCancelEvent(eventId: number) {
  selectedEventForCancel.value = eventId
  isCancelConfirmOpen.value = true
}

async function confirmCancelEvent() {
  if (!selectedEventForCancel.value) {
    isCancelConfirmOpen.value = false
    return
  }
  const eventId = selectedEventForCancel.value
  selectedEventForCancel.value = null
  isCancelConfirmOpen.value = false
  await cancelEvent(eventId)
}

function closeCancelConfirm() {
  isCancelConfirmOpen.value = false
  selectedEventForCancel.value = null
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
      category_id: event.category_id ?? undefined,
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
    const eventUrl = getEventLink(eventId)
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

function getEventLink(eventId: number) {
  const baseUrl = window.location.origin
  return `${baseUrl}/dashboard/calendar?event=${eventId}`
}

async function resolveEventForCopy(eventId: number) {
  const listItem = events.value.find(item => item.id === eventId)
  if (listItem) return listItem
  try {
    return await calendarResource.getEvent(eventId)
  } catch {
    return null
  }
}

async function copyEventTitle(eventId: number) {
  const event = await resolveEventForCopy(eventId)
  if (!event) {
    toast.add({ title: 'Blad', description: 'Nie udalo sie znalezc wydarzenia.', color: 'error' })
    return
  }
  try {
    await navigator.clipboard.writeText(event.title)
    toast.add({ title: 'Skopiowano', description: 'Tytul wydarzenia zostal skopiowany.', color: 'success' })
  } catch {
    toast.add({ title: 'Blad', description: 'Nie udalo sie skopiowac tytulu.', color: 'error' })
  }
}

async function copyEventDate(eventId: number) {
  const event = await resolveEventForCopy(eventId)
  if (!event) {
    toast.add({ title: 'Blad', description: 'Nie udalo sie znalezc wydarzenia.', color: 'error' })
    return
  }
  const start = new Date(event.start_at)
  const end = new Date(event.end_at)
  const startDate = start.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const endDate = end.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const startTime = start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const endTime = end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const value = startDate === endDate
    ? `${startDate}, ${startTime} - ${endTime}`
    : `${startDate} ${startTime} - ${endDate} ${endTime}`

  try {
    await navigator.clipboard.writeText(value)
    toast.add({ title: 'Skopiowano', description: 'Termin wydarzenia zostal skopiowany.', color: 'success' })
  } catch {
    toast.add({ title: 'Blad', description: 'Nie udalo sie skopiowac terminu.', color: 'error' })
  }
}

async function copyEventId(eventId: number) {
  try {
    await navigator.clipboard.writeText(String(eventId))
    toast.add({ title: 'Skopiowano', description: 'ID wydarzenia zostalo skopiowane.', color: 'success' })
  } catch {
    toast.add({ title: 'Blad', description: 'Nie udalo sie skopiowac ID.', color: 'error' })
  }
}

async function copyEventDescription(eventId: number) {
  const event = await resolveEventForCopy(eventId)
  if (!event) {
    toast.add({ title: 'Blad', description: 'Nie udalo sie znalezc wydarzenia.', color: 'error' })
    return
  }
  const description = 'description' in event && typeof event.description === 'string' ? event.description : ''
  if (!description) {
    toast.add({ title: 'Brak opisu', description: 'To wydarzenie nie ma opisu.', color: 'info' })
    return
  }
  try {
    await navigator.clipboard.writeText(description)
    toast.add({ title: 'Skopiowano', description: 'Opis wydarzenia zostal skopiowany.', color: 'success' })
  } catch {
    toast.add({ title: 'Blad', description: 'Nie udalo sie skopiowac opisu.', color: 'error' })
  }
}

async function shareEventLinkInChat(eventId: number) {
  try {
    const response = await $fetch<{ thread_id: number }>(`/api/calendar/events/${eventId}/chat-thread`, {
      method: 'POST'
    })

    if (!response.thread_id) return

    chatStore.ensureInitialized()
    const eventUrl = getEventLink(eventId)
    const event = await resolveEventForCopy(eventId)
    const title = event?.title ? `Udostepniam wydarzenie: ${event.title}` : 'Udostepniam wydarzenie:'
    const message = `${title}\n${eventUrl}`

    chatStore.setDraft(response.thread_id, message)
    await navigateTo(`/dashboard/chat?thread=${response.thread_id}`)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udalo sie przygotowac wiadomosci w czacie'
    toast.add({ title: 'Blad', description: message, color: 'error' })
  }
}

async function changeCategoryFor(eventId: number, categoryId: number | null) {
  try {
    await calendarResource.updateEvent(eventId, { category_id: categoryId ?? undefined })
    await loadEvents()
    if (categoryId) {
      const category = categories.value.find(cat => cat.id === categoryId)
      toast.add({
        title: 'Zaktualizowano',
        description: category ? `Kategoria zmieniona na "${category.label}"` : 'Kategoria zaktualizowana',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Zaktualizowano',
        description: 'Kategoria usunięta',
        color: 'success'
      })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Nie udało się zmienić kategorii'
    toast.add({ title: 'Błąd', description: message, color: 'error' })
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
  const event = events.value.find(item => item.id === payload.id)
  if (event?.team_id && !canMoveTeamEvents.value) {
    toast.add({
      title: 'Brak uprawnień',
      description: 'Nie masz uprawnień do przenoszenia tego wydarzenia.',
      color: 'error'
    })
    return
  }

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

watch([scope, teamId], () => {
  loadCategories()
}, { immediate: true })

watch(teamId, () => {
  loadTeamRole()
  loadTeamMembers()
}, { immediate: true })

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
            :category-colors="categoryColors"
            :categories="categories"
            :team-members="teamMemberPreview"
            :team-names="teamNameMap"
            :is-loading="isLoading"
            :show-weekends="prefs.showWeekends"
            :day-range="dayRange"
            :is-selecting-day="isSelectingDay"
            :can-move-team-events="canMoveTeamEvents"
            @refresh="loadEvents"
            @select-date="setDateParts"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @request-cancel="requestCancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @copy-title="copyEventTitle"
            @copy-date="copyEventDate"
            @copy-id="copyEventId"
            @copy-description="copyEventDescription"
            @open-chat="openEventChat"
            @share-chat-link="shareEventLinkInChat"
            @change-category-for="changeCategoryFor"
            @move-scope="openMoveToTeamModal"
            @move-event="handleMoveEvent"
            @day-start="selection.startDaySelection($event.date, $event.shiftKey)"
            @day-hover="selection.updateDaySelection($event)"
            @day-end="finalizeDaySelection"
          />

          <CalendarViewsWeek
            v-else-if="viewMode === 'week'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :category-colors="categoryColors"
            :categories="categories"
            :team-members="teamMemberPreview"
            :team-names="teamNameMap"
            :is-loading="isLoading"
            :show-weekends="prefs.showWeekends"
            :show-work-hours-only="prefs.showWorkHoursOnly"
            :workday-start-hour="prefs.workdayStartHour"
            :workday-end-hour="prefs.workdayEndHour"
            :time-range="timeRange"
            :is-selecting-time="isSelectingTime"
            :can-move-team-events="canMoveTeamEvents"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @request-cancel="requestCancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @copy-title="copyEventTitle"
            @copy-date="copyEventDate"
            @copy-id="copyEventId"
            @copy-description="copyEventDescription"
            @open-chat="openEventChat"
            @share-chat-link="shareEventLinkInChat"
            @change-category-for="changeCategoryFor"
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
            :category-colors="categoryColors"
            :day-range="dayRange"
            @refresh="loadEvents"
            @open-month="(month: number) => setDateParts({ month, day: 1 })"
            @range-change="handleDayRangeChange($event)"
          />

          <CalendarViewsSchedule
            v-else-if="viewMode === 'schedule'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :category-colors="categoryColors"
            :categories="categories"
            :team-members="teamMemberPreview"
            :team-names="teamNameMap"
            :is-loading="isLoading"
            :show-weekends="prefs.showWeekends"
            :day-range="dayRange"
            :is-selecting-day="isSelectingDay"
            :can-move-team-events="canMoveTeamEvents"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @request-cancel="requestCancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @copy-title="copyEventTitle"
            @copy-date="copyEventDate"
            @copy-id="copyEventId"
            @copy-description="copyEventDescription"
            @open-chat="openEventChat"
            @share-chat-link="shareEventLinkInChat"
            @change-category-for="changeCategoryFor"
            @move-scope="openMoveToTeamModal"
            @move-event="handleMoveEvent"
            @day-start="selection.startDaySelection($event.date, $event.shiftKey)"
            @day-hover="selection.updateDaySelection($event)"
            @day-end="finalizeDaySelection"
          />

          <CalendarViewsFourDay
            v-else-if="viewMode === 'four-day'"
            :effective-date="effectiveDate"
            :events="visibleEvents"
            :category-colors="categoryColors"
            :categories="categories"
            :team-members="teamMemberPreview"
            :team-names="teamNameMap"
            :is-loading="isLoading"
            :show-work-hours-only="prefs.showWorkHoursOnly"
            :workday-start-hour="prefs.workdayStartHour"
            :workday-end-hour="prefs.workdayEndHour"
            :time-range="timeRange"
            :is-selecting-time="isSelectingTime"
            :can-move-team-events="canMoveTeamEvents"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @request-cancel="requestCancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @copy-title="copyEventTitle"
            @copy-date="copyEventDate"
            @copy-id="copyEventId"
            @copy-description="copyEventDescription"
            @open-chat="openEventChat"
            @share-chat-link="shareEventLinkInChat"
            @change-category-for="changeCategoryFor"
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
            :category-colors="categoryColors"
            :categories="categories"
            :team-members="teamMemberPreview"
            :team-names="teamNameMap"
            :is-loading="isLoading"
            :show-work-hours-only="prefs.showWorkHoursOnly"
            :workday-start-hour="prefs.workdayStartHour"
            :workday-end-hour="prefs.workdayEndHour"
            :time-range="timeRange"
            :is-selecting-time="isSelectingTime"
            :can-move-team-events="canMoveTeamEvents"
            @refresh="loadEvents"
            @edit="openEditModal"
            @cancel="cancelEvent"
            @request-cancel="requestCancelEvent"
            @duplicate="duplicateEvent"
            @copy-link="copyEventLink"
            @copy-title="copyEventTitle"
            @copy-date="copyEventDate"
            @copy-id="copyEventId"
            @copy-description="copyEventDescription"
            @open-chat="openEventChat"
            @share-chat-link="shareEventLinkInChat"
            @change-category-for="changeCategoryFor"
            @move-scope="openMoveToTeamModal"
            @move-event="handleMoveEvent"
            @resize-event="handleResizeEvent"
            @time-start="selection.startTimeSelection($event.date, $event.shiftKey)"
            @time-hover="selection.updateTimeSelection($event)"
            @time-end="handleTimeRangeComplete(selection.endTimeSelection())"
          />
        </div>

        <CalendarModalsCreateEventModal
          v-model:open="isCreateOpen"
          :form="form"
          :categories="categories"
          :on-submit="submitCreate"
          :on-submit-manual="submitCreateManual"
          :on-keydown="handleCreateKeydown"
        />

        <CalendarModalsEditEventModal
          v-model:open="isEditOpen"
          :form="form"
          :selected-event="selectedEvent"
          :categories="categories"
          :on-submit="submitUpdate"
          :on-submit-manual="submitUpdateManual"
          :on-keydown="handleEditKeydown"
        />

        <CalendarModalsMoveEventModal
          v-model:open="isMoveToTeamOpen"
          :teams="teams"
          :on-move="moveEventToTeam"
        />

        <UModal v-model:open="isCancelConfirmOpen">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-base font-semibold">
                Anuluj wydarzenie
              </h3>
              <UButton
                icon="i-lucide-x"
                variant="ghost"
                color="neutral"
                @click="closeCancelConfirm"
              />
            </div>
          </template>
          <template #body>
            <UCard>
              <p class="text-sm text-neutral-600 dark:text-neutral-400">
                Czy na pewno chcesz anulowac to wydarzenie? Uczestnicy zostana poinformowani.
              </p>
              <div class="mt-4 flex justify-end gap-2">
                <UButton
                  variant="ghost"
                  color="neutral"
                  @click="closeCancelConfirm"
                >
                  Zamknij
                </UButton>
                <UButton
                  color="error"
                  @click="confirmCancelEvent"
                >
                  Anuluj wydarzenie
                </UButton>
              </div>
            </UCard>
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
