/**
 * GET /api/settings/me
 *
 * Zwraca ustawienia zalogowanego użytkownika (UserSettings + showEmail z User).
 * Wymaga sesji (401 bez sesji).
 */
import { getUserSettingsUseCase } from '~~/domain/settings/getUserSettings.usecase'
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

  const data = await getUserSettingsUseCase(userId, settingsRepository, userRepository)
  return { data }
})
