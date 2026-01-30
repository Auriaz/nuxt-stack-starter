/**
 * GET /api/profile/activity/stats
 *
 * Zwraca statystyki aktywności użytkownika z bazy (ActivityLog).
 * Wymaga sesji.
 */
import { activityLogRepository } from '~~/server/repositories/activityLog.repo'

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

  const total_actions = await activityLogRepository.countByUserId(userId)
  return { data: { total_actions } }
})
