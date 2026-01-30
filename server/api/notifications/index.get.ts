/**
 * GET /api/notifications
 *
 * Lista powiadomień zalogowanego użytkownika.
 * Wymaga sesji (401 bez sesji).
 */
import { listNotificationsUseCase } from '~~/domain/notifications/listNotifications.usecase'
import { notificationRepository } from '~~/server/repositories/notification.repo'

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

  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : 50

  const list = await listNotificationsUseCase(userId, notificationRepository, limit)
  return { data: list }
})
