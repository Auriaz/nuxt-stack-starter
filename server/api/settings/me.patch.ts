/**
 * PATCH /api/settings/me
 *
 * Częściowa aktualizacja ustawień zalogowanego użytkownika (UserSettings).
 * Nie zmienia showEmail — do tego służy PATCH /api/profile/privacy.
 * Wymaga sesji. Walidacja: SettingsUpdateSchema.
 */
import { safeParse } from 'valibot'
import { SettingsUpdateSchema } from '#shared/schemas/settings'
import { updateUserSettingsUseCase } from '~~/domain/settings/updateUserSettings.usecase'
import { settingsRepository } from '~~/server/repositories/settings.repo'
import { userRepository } from '~~/server/repositories/user.repo'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: number }).id
  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session has no user id'
        }
      }
    })
  }

  const body = await readBody(event)
  const parsed = safeParse(SettingsUpdateSchema, body)
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          issues: parsed.issues
        }
      }
    })
  }

  const data = await updateUserSettingsUseCase(
    userId,
    parsed.output,
    settingsRepository,
    userRepository
  )
  return { data }
})
