/**
 * Use-case: pobranie ustawień użytkownika (UserSettings + showEmail z User).
 * Jeśli brak wiersza UserSettings — zwraca domyślne wartości (zgodne ze schema).
 */
import type { SettingsDTO } from '#shared/types'
import type { SettingsRepository } from '~~/server/repositories/settings.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'

const DEFAULTS = {
  locale: 'pl',
  timezone: 'Europe/Warsaw',
  appearanceTheme: 'system',
  emailNotifications: true,
  marketingEmails: false
} as const

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
      showEmail
    }
  }

  return {
    locale: settings.locale ?? DEFAULTS.locale,
    timezone: settings.timezone ?? DEFAULTS.timezone,
    appearanceTheme: settings.appearanceTheme ?? DEFAULTS.appearanceTheme,
    emailNotifications: settings.emailNotifications,
    marketingEmails: settings.marketingEmails,
    showEmail
  }
}
