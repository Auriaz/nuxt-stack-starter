import { safeParse } from 'valibot'
import { CalendarRangeQuerySchema } from '#shared/schemas/calendar'
import type { CalendarRangeQuery } from '#shared/types/calendar'
import { listEventsInRangeUseCase } from '~~/domain/calendar/listEventsInRange.usecase'
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

  const query = getQuery(event)
  const parseResult = safeParse(CalendarRangeQuerySchema, query)
  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', status: 422, issues: parseResult.issues } }
    })
  }

  try {
    const data = await listEventsInRangeUseCase(
      userId,
      user?.permissions ?? [],
      parseResult.output as CalendarRangeQuery,
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
