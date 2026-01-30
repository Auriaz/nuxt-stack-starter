/**
 * GET /api/profile/security
 *
 * Zwraca informacje bezpieczeństwa konta (weryfikacja email, hasło, liczba sesji).
 * Wymaga sesji.
 */
import { getSecurityInfoUseCase } from '~~/domain/profile/getSecurityInfo.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { userSessionRepository } from '~~/server/repositories/userSession.repo'

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

  const securityInfo = await getSecurityInfoUseCase(userId, userRepository)
  if (!securityInfo) {
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

  const sessions = await userSessionRepository.findByUserId(userId)
  const active_sessions_count = sessions.length

  return {
    data: {
      email_verified: securityInfo.email_verified,
      last_password_change: securityInfo.last_password_change,
      password_strength: securityInfo.password_strength,
      password_changed_days_ago: securityInfo.password_changed_days_ago,
      active_sessions_count
    }
  }
})
