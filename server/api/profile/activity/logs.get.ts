/**
 * GET /api/profile/activity/logs
 *
 * Zwraca logi aktywności użytkownika z bazy (ActivityLog).
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

  const rows = await activityLogRepository.findRecentByUserId(userId, 50)
  const logs = rows.map(row => ({
    id: row.id,
    action: row.action,
    description: row.description ?? undefined,
    created_at: row.createdAt.toISOString()
  }))
  return { data: logs }
})
