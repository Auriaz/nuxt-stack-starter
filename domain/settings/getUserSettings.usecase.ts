/**
 * Use-case: pobranie ustawień użytkownika (UserSettings + showEmail z User).
 * Jeśli brak wiersza UserSettings — zwraca domyślne wartości (zgodne ze schema).
 * llmProviders zwracane bez kluczy — tylko provider + hasKey.
 */
import type { SettingsDTO } from '#shared/types'
import type { SettingsRepository } from '~~/server/repositories/settings.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { parseLlmProviders } from '~~/server/repositories/settings.repo'

const DEFAULTS = {
  locale: 'pl',
  timezone: 'Europe/Warsaw',
  appearanceTheme: 'system',
  emailNotifications: true,
  marketingEmails: false
} as const

const DEFAULT_CALENDAR_PREFS = {
  defaultView: 'month',
  showWeekends: true,
  showCancelled: false,
  showWorkHoursOnly: false,
  workdayStartHour: 8,
  workdayEndHour: 18,
  timezone: 'Europe/Warsaw',
  scope: 'personal'
} as const

function normalizeCalendarPrefs(value: unknown) {
  if (!value || typeof value !== 'object') return { ...DEFAULT_CALENDAR_PREFS }
  const prefs = value as Record<string, unknown>

  return {
    defaultView: typeof prefs.defaultView === 'string' ? prefs.defaultView : DEFAULT_CALENDAR_PREFS.defaultView,
    showWeekends: typeof prefs.showWeekends === 'boolean' ? prefs.showWeekends : DEFAULT_CALENDAR_PREFS.showWeekends,
    showCancelled: typeof prefs.showCancelled === 'boolean' ? prefs.showCancelled : DEFAULT_CALENDAR_PREFS.showCancelled,
    showWorkHoursOnly: typeof prefs.showWorkHoursOnly === 'boolean' ? prefs.showWorkHoursOnly : DEFAULT_CALENDAR_PREFS.showWorkHoursOnly,
    workdayStartHour: typeof prefs.workdayStartHour === 'number' ? prefs.workdayStartHour : DEFAULT_CALENDAR_PREFS.workdayStartHour,
    workdayEndHour: typeof prefs.workdayEndHour === 'number' ? prefs.workdayEndHour : DEFAULT_CALENDAR_PREFS.workdayEndHour,
    timezone: typeof prefs.timezone === 'string' ? prefs.timezone : DEFAULT_CALENDAR_PREFS.timezone,
    scope: typeof prefs.scope === 'string' ? prefs.scope : DEFAULT_CALENDAR_PREFS.scope,
    teamId: typeof prefs.teamId === 'number' ? prefs.teamId : undefined
  }
}

function toLlmProvidersOutput(
  entries: { provider: string, apiKey: string }[]
): { provider: string, hasKey: boolean }[] {
  return entries.map(e => ({ provider: e.provider, hasKey: Boolean(e.apiKey?.trim()) }))
}

export async function getUserSettingsUseCase(
  userId: number,
  settingsRepository: SettingsRepository,
  userRepository: UserRepository
): Promise<SettingsDTO> {
  const [settings, user] = await Promise.all([
    settingsRepository.findByUserId(userId),
    userRepository.findById(userId)
  ])

  const showEmail = user ? (user as { showEmail?: boolean }).showEmail !== false : true

  if (!settings) {
    return {
      locale: DEFAULTS.locale,
      timezone: DEFAULTS.timezone,
      appearanceTheme: DEFAULTS.appearanceTheme,
      emailNotifications: DEFAULTS.emailNotifications,
      marketingEmails: DEFAULTS.marketingEmails,
      showEmail,
      hasLlmKey: false,
      llmProviders: [],
      llmSystemPrompt: undefined,
      calendarPrefs: { ...DEFAULT_CALENDAR_PREFS }
    }
  }

  const llmProvidersRaw = (settings as { llmProviders?: unknown }).llmProviders
  const llmProviders = toLlmProvidersOutput(parseLlmProviders(llmProvidersRaw))
  const hasLlmKey
    = Boolean((settings as { llmApiKey?: string | null }).llmApiKey?.trim())
      || llmProviders.some(p => p.hasKey)

  const llmSystemPrompt = (settings as { llmSystemPrompt?: string | null }).llmSystemPrompt?.trim() || undefined
  const calendarPrefsRaw = (settings as { calendarPrefs?: unknown }).calendarPrefs
  const calendarPrefs = normalizeCalendarPrefs(calendarPrefsRaw)
  return {
    locale: settings.locale ?? DEFAULTS.locale,
    timezone: settings.timezone ?? DEFAULTS.timezone,
    appearanceTheme: settings.appearanceTheme ?? DEFAULTS.appearanceTheme,
    emailNotifications: settings.emailNotifications,
    marketingEmails: settings.marketingEmails,
    showEmail,
    hasLlmKey,
    llmProviders,
    llmSystemPrompt,
    calendarPrefs
  }
}
