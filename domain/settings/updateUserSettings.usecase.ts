/**
 * Use-case: aktualizacja ustawień użytkownika (tylko UserSettings).
 * Nie zmienia showEmail — do tego służy PATCH /api/profile/privacy.
 * Zwraca pełny SettingsDTO po zapisie.
 */
import type { SettingsDTO, SettingsUpdateInput } from '#shared/types'
import type { SettingsRepository } from '~~/server/repositories/settings.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { getUserSettingsUseCase } from './getUserSettings.usecase'

export async function updateUserSettingsUseCase(
  userId: number,
  payload: SettingsUpdateInput,
  settingsRepository: SettingsRepository,
  userRepository: UserRepository
): Promise<SettingsDTO> {
  await settingsRepository.upsert(userId, {
    locale: payload.locale,
    timezone: payload.timezone,
    appearanceTheme: payload.appearanceTheme,
    emailNotifications: payload.emailNotifications,
    marketingEmails: payload.marketingEmails
  })

  return await getUserSettingsUseCase(userId, settingsRepository, userRepository)
}
