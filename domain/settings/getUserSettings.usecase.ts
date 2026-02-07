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
      llmSystemPrompt: undefined
    }
  }

  const llmProvidersRaw = (settings as { llmProviders?: unknown }).llmProviders
  const llmProviders = toLlmProvidersOutput(parseLlmProviders(llmProvidersRaw))
  const hasLlmKey
    = Boolean((settings as { llmApiKey?: string | null }).llmApiKey?.trim())
      || llmProviders.some(p => p.hasKey)

  const llmSystemPrompt = (settings as { llmSystemPrompt?: string | null }).llmSystemPrompt?.trim() || undefined
  return {
    locale: settings.locale ?? DEFAULTS.locale,
    timezone: settings.timezone ?? DEFAULTS.timezone,
    appearanceTheme: settings.appearanceTheme ?? DEFAULTS.appearanceTheme,
    emailNotifications: settings.emailNotifications,
    marketingEmails: settings.marketingEmails,
    showEmail,
    hasLlmKey,
    llmProviders,
    llmSystemPrompt
  }
}
