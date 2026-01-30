/**
 * GET /api/profile/me/download
 *
 * Zwraca dane profilu użytkownika w formacie JSON do eksportu (np. GDPR).
 * Wymaga sesji.
 */
import { getProfileUseCase } from '~~/domain/profile/getProfile.usecase'
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

  const profile = await getProfileUseCase(userId, userRepository)
  if (!profile) {
    throw createError({
      status: 404,
      statusText: 'Not Found',
      data: {
        error: {
          code: 'NOT_FOUND',
          message: 'User not found'
        }
      }
    })
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    profile
  }

  const filename = `export-danych-${new Date().toISOString().slice(0, 10)}.json`
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')

  return payload
})
