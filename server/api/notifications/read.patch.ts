/**
 * PATCH /api/notifications/read
 *
 * Oznacza powiadomienia jako przeczytane (ids lub all: true).
 * Wymaga sesji. Walidacja: MarkNotificationsReadInputSchema.
 */
import { safeParse } from 'valibot'
import { MarkNotificationsReadInputSchema } from '#shared/schemas/notification'
import { markNotificationsReadUseCase } from '~~/domain/notifications/markNotificationsRead.usecase'
import { notificationRepository } from '~~/server/repositories/notification.repo'
import { publishNotificationsRead } from '~~/server/utils/notifications'

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
  const parsed = safeParse(MarkNotificationsReadInputSchema, body ?? {})
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

  const result = await markNotificationsReadUseCase(
    userId,
    { ids: parsed.output.ids, all: parsed.output.all },
    notificationRepository
  )
  publishNotificationsRead(userId, { ids: parsed.output.ids, all: parsed.output.all })
  return { data: result }
})
