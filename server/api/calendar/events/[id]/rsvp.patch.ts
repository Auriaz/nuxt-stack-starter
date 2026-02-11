import { safeParse } from 'valibot'
import { CalendarEventRsvpInputSchema } from '#shared/schemas/calendar'
import type { CalendarEventRsvpInput } from '#shared/types/calendar'
import { updateRsvpUseCase } from '~~/domain/calendar/updateRsvp.usecase'
import { DomainError } from '~~/domain/shared/errors'
import { calendarRepository } from '~~/server/repositories/calendar.repo'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number } | undefined
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

  const body = await readBody(event)
  const parseResult = safeParse(CalendarEventRsvpInputSchema, body)
  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', status: 422, issues: parseResult.issues } }
    })
  }

  try {
    const data = await updateRsvpUseCase(
      { userId, eventId, input: parseResult.output as CalendarEventRsvpInput },
      { calendarRepository }
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
