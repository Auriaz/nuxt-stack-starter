import { CalendarDate } from '@internationalized/date'
import type { Ref } from 'vue'

export type CalendarViewMode = 'year' | 'month' | 'week' | 'day' | 'schedule' | 'four-day'

const VALID_VIEWS: CalendarViewMode[] = ['year', 'month', 'week', 'day', 'schedule', 'four-day']

function parseDateParam(value: string | undefined): CalendarDate | null {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new CalendarDate(year, month, day)
}

function formatDateParam(date: CalendarDate | null): string | undefined {
  if (!date) return undefined
  const pad = (num: number) => String(num).padStart(2, '0')
  return `${date.year}-${pad(date.month)}-${pad(date.day)}`
}

export function useCalendarView(options?: {
  defaultView?: CalendarViewMode | Ref<CalendarViewMode | undefined>
  initialDate?: CalendarDate | null
}) {
  const route = useRoute()
  const router = useRouter()

  const initialDate = options?.initialDate
  const today = new Date()
  const fallbackDate = new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  const viewMode = ref<CalendarViewMode>('month')
  const selectedDate = shallowRef<CalendarDate | null>(initialDate ?? fallbackDate)

  function resolveDefaultView(): CalendarViewMode {
    const value = options?.defaultView
    if (typeof value === 'string') return value
    if (value && typeof value === 'object' && 'value' in value && value.value) return value.value
    return 'month'
  }

  function setFromQuery() {
    const viewParam = route.query.view as string | undefined
    const dateParam = route.query.date as string | undefined

    if (viewParam && VALID_VIEWS.includes(viewParam as CalendarViewMode)) {
      viewMode.value = viewParam as CalendarViewMode
    } else {
      viewMode.value = resolveDefaultView()
    }

    const parsedDate = parseDateParam(dateParam)
    if (parsedDate) {
      selectedDate.value = parsedDate
    }
  }

  watch(
    () => route.query,
    () => setFromQuery(),
    { immediate: true }
  )

  // Gdy zmienia się defaultView w preferencjach, zaktualizuj widok jeśli nie ma query param 'view'
  watch(
    () => options?.defaultView && (typeof options.defaultView === 'object' ? options.defaultView.value : options.defaultView),
    (newDefaultView, oldDefaultView) => {
      // Jeśli obecny widok to stary defaultView, zmień na nowy defaultView
      if (newDefaultView && oldDefaultView && viewMode.value === oldDefaultView) {
        viewMode.value = newDefaultView
      } else if (!route.query.view && newDefaultView) {
        // Lub jeśli nie ma query param 'view' w URL, użyj nowego defaultView
        viewMode.value = newDefaultView
      }
    }
  )

  watch([viewMode, selectedDate], () => {
    const currentDefaultView = resolveDefaultView()
    const nextQuery: Record<string, string | undefined> = {
      ...route.query
    }

    // Jeśli widok jest taki sam jak defaultView, usuń go z URL
    if (viewMode.value === currentDefaultView) {
      delete nextQuery.view
    } else {
      nextQuery.view = viewMode.value
    }

    nextQuery.date = formatDateParam(selectedDate.value)

    const viewChanged = (route.query.view || currentDefaultView) !== (nextQuery.view || currentDefaultView)
    const dateChanged = route.query.date !== nextQuery.date

    if (viewChanged || dateChanged) {
      router.replace({ query: nextQuery })
    }
  })

  return {
    viewMode,
    selectedDate
  }
}
