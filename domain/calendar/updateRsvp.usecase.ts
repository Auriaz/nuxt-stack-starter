import type { CalendarEventDTO, CalendarEventRsvpInput } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import { ForbiddenError, NotFoundError } from '../shared/errors'
import { toCalendarEventDTO } from './calendar.mapper'
import { notifyCalendarOwner } from './calendar.notifications'

export async function updateRsvpUseCase(
  params: { userId: number, eventId: number, input: CalendarEventRsvpInput },
  deps: { calendarRepository: CalendarRepository }
): Promise<CalendarEventDTO> {
  const event = await deps.calendarRepository.findEventById(params.eventId)
  if (!event) {
    throw new NotFoundError('Calendar event not found')
  }

  const participants = await deps.calendarRepository.listParticipants(event.id)
  const isParticipant = participants.some(participant => participant.userId === params.userId)
  if (!isParticipant) {
    throw new ForbiddenError('Not a participant')
  }

  await deps.calendarRepository.updateParticipantRsvp(event.id, params.userId, params.input.status)

  const updatedParticipants = await deps.calendarRepository.listParticipants(event.id)
  const reminders = await deps.calendarRepository.listReminders(event.id)
  await notifyCalendarOwner({
    action: 'calendar.event.rsvp.updated',
    event,
    actorId: params.userId
  })
  return toCalendarEventDTO(event, updatedParticipants, reminders)
}
