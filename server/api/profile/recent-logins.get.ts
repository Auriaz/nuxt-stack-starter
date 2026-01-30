/**
 * GET /api/profile/recent-logins
 *
 * Zwraca ostatnie logowania użytkownika z bazy (LoginEvent).
 * Wymaga sesji.
 */
import { loginEventRepository } from '~~/server/repositories/loginEvent.repo'

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

  const rows = await loginEventRepository.findRecentByUserId(userId, 20)
  const recentLogins = rows.map(row => ({
    id: row.id,
    ip_address: row.ipAddress ?? undefined,
    location: row.location ?? undefined,
    timestamp: row.createdAt.toISOString()
  }))
  return { data: recentLogins }
})
