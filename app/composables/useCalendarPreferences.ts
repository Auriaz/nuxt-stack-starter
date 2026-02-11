import type { SettingsDTO } from '#shared/types'
import { useDebounceFn } from '@vueuse/core'
import { useSettingsResource } from './resources/useSettingsResource'
import type { CalendarViewMode } from './useCalendarView'

export type CalendarPrefs = {
  defaultView: CalendarViewMode
  showWeekends: boolean
  showCancelled: boolean
  showWorkHoursOnly: boolean
  workdayStartHour: number
  workdayEndHour: number
  timezone: string
  scope: 'personal' | 'team' | 'all'
  teamId?: number
}

const DEFAULT_PREFS: CalendarPrefs = {
  defaultView: 'month',
  showWeekends: true,
  showCancelled: false,
  showWorkHoursOnly: false,
  workdayStartHour: 8,
  workdayEndHour: 18,
  timezone: 'Europe/Warsaw',
  scope: 'personal',
  teamId: undefined
}

function mergePrefs(value?: SettingsDTO['calendarPrefs']): CalendarPrefs {
  return {
    ...DEFAULT_PREFS,
    ...(value ?? {})
  }
}

export function useCalendarPreferences() {
  const settingsResource = useSettingsResource()
  const prefs = useState<CalendarPrefs>('calendar-prefs', () => ({ ...DEFAULT_PREFS }))
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const persist = useDebounceFn(async (nextPrefs: CalendarPrefs) => {
    try {
      const data = await settingsResource.updateMySettings({
        calendarPrefs: nextPrefs
      })
      prefs.value = mergePrefs(data.calendarPrefs)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie zapisac ustawien kalendarza'
    }
  }, 600)

  async function load() {
    isLoading.value = true
    error.value = null
    try {
      const data = await settingsResource.getMySettings()
      prefs.value = mergePrefs(data.calendarPrefs)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac ustawien kalendarza'
    } finally {
      isLoading.value = false
    }
  }

  function updatePrefs(patch: Partial<CalendarPrefs>) {
    prefs.value = { ...prefs.value, ...patch }
    persist(prefs.value)
  }

  return {
    prefs: readonly(prefs),
    isLoading: readonly(isLoading),
    error: readonly(error),
    load,
    updatePrefs
  }
}
