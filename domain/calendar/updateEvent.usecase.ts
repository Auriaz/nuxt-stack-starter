import type { CalendarEventDTO, UpdateCalendarEventInput } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { NotFoundError, ValidationError } from '../shared/errors'
import { assertCanAccessEventUseCase } from './assertCanAccessEvent.usecase'
import { toCalendarEventDTO } from './calendar.mapper'
import { notifyCalendarEventChange } from './calendar.notifications'

function parseDate(value: string, label: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`Invalid ${label} date`)
  }
  return date
}

export async function updateEventUseCase(
  params: { userId: number, permissions: string[], eventId: number, input: UpdateCalendarEventInput },
  deps: { calendarRepository: CalendarRepository, teamsRepository: TeamsRepository }
): Promise<CalendarEventDTO> {
  const event = await deps.calendarRepository.findEventById(params.eventId)
  if (!event) {
    throw new NotFoundError('Calendar event not found')
  }

  await assertCanAccessEventUseCase(
    { userId: params.userId, permissions: params.permissions, event, action: 'write' },
    { teamsRepository: deps.teamsRepository }
  )

  const nextStart = params.input.start_at ? parseDate(params.input.start_at, 'start_at') : event.startAt
  const nextEnd = params.input.end_at ? parseDate(params.input.end_at, 'end_at') : event.endAt
  if (nextStart >= nextEnd) {
    throw new ValidationError('Invalid date range')
  }

  if (typeof params.input.team_id === 'number' && params.input.team_id !== event.teamId) {
    const member = await deps.teamsRepository.findMember(params.input.team_id, params.userId)
    if (!member) {
      throw new ValidationError('Invalid team_id')
    }
  }

  const updated = await deps.calendarRepository.updateEvent(params.eventId, {
    title: params.input.title,
    description: params.input.description ?? undefined,
    startAt: params.input.start_at ? nextStart : undefined,
    endAt: params.input.end_at ? nextEnd : undefined,
    timezone: params.input.timezone,
    teamId: typeof params.input.team_id === 'number' ? params.input.team_id : undefined,
    visibility: params.input.visibility,
    location: params.input.location ?? undefined,
    url: params.input.url ?? undefined
  })

  if (Array.isArray(params.input.participant_ids)) {
    await deps.calendarRepository.addParticipants(
      params.input.participant_ids.map(userId => ({
        eventId: updated.id,
        userId,
        role: 'attendee',
        rsvpStatus: 'invited',
        invitedById: params.userId
      }))
    )
  }

  if (typeof params.input.reminder_minutes === 'number') {
    await deps.calendarRepository.clearReminders(updated.id)
    await deps.calendarRepository.addReminder(updated.id, params.input.reminder_minutes, 'in_app')
  }

  const participants = await deps.calendarRepository.listParticipants(updated.id)
  const reminders = await deps.calendarRepository.listReminders(updated.id)
  await notifyCalendarEventChange({
    action: 'calendar.event.updated',
    event: updated,
    actorId: params.userId,
    participants,
    teamsRepository: deps.teamsRepository
  })
  return toCalendarEventDTO(updated, participants, reminders)
}
