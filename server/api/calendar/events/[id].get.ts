import { getEventByIdUseCase } from '~~/domain/calendar/getEventById.usecase'
import { DomainError } from '~~/domain/shared/errors'
import { calendarRepository } from '~~/server/repositories/calendar.repo'
import { teamsRepository } from '~~/server/repositories/teams.repo'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id
  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } }
    })
  }

  const idParam = getRouterParam(event, 'id')
  const eventId = idParam ? Number(idParam) : NaN
  if (!eventId || Number.isNaN(eventId)) {
    throw createError({
      status: 400,
      statusText: 'Bad Request',
      data: { error: { code: 'INVALID_ID', message: 'Invalid event id' } }
    })
  }

  try {
    const data = await getEventByIdUseCase(
      { userId, permissions: user?.permissions ?? [], eventId },
      { calendarRepository, teamsRepository }
    )
    return { data }
  } catch (error) {
    if (error instanceof DomainError) {
      throw createError({
        status: error.statusCode,
        statusText: error.message,
        data: { error: { code: error.code, message: error.message, status: error.statusCode } }
      })
    }
    throw error
  }
})
