import type { CalendarEventDTO } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { NotFoundError } from '../shared/errors'
import { assertCanAccessEventUseCase } from './assertCanAccessEvent.usecase'
import { toCalendarEventDTO } from './calendar.mapper'

export async function getEventByIdUseCase(
  params: { userId: number, permissions: string[], eventId: number },
  deps: { calendarRepository: CalendarRepository, teamsRepository: TeamsRepository }
): Promise<CalendarEventDTO> {
  const event = await deps.calendarRepository.findEventById(params.eventId)
  if (!event) {
    throw new NotFoundError('Calendar event not found')
  }

  const participants = await deps.calendarRepository.listParticipants(event.id)
  const isParticipant = participants.some(participant => participant.userId === params.userId)

  if (!isParticipant) {
    await assertCanAccessEventUseCase(
      { userId: params.userId, permissions: params.permissions, event, action: 'read' },
      { teamsRepository: deps.teamsRepository }
    )
  }

  const reminders = await deps.calendarRepository.listReminders(event.id)
  return toCalendarEventDTO(event, participants, reminders)
}
