import { safeParse } from 'valibot'
import { CreateCalendarEventInputSchema } from '#shared/schemas/calendar'
import type { CreateCalendarEventInput } from '#shared/types/calendar'
import { createEventUseCase } from '~~/domain/calendar/createEvent.usecase'
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

  const body = await readBody(event)
  const parseResult = safeParse(CreateCalendarEventInputSchema, body)
  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', status: 422, issues: parseResult.issues } }
    })
  }

  try {
    const data = await createEventUseCase(
      { userId, permissions: user?.permissions ?? [], input: parseResult.output as CreateCalendarEventInput },
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
