import { PERMISSIONS } from '#shared/permissions'
import type { CalendarEventDTO, InviteParticipantsInput } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { ForbiddenError, NotFoundError, ValidationError } from '../shared/errors'
import { assertCanAccessEventUseCase } from './assertCanAccessEvent.usecase'
import { toCalendarEventDTO } from './calendar.mapper'
import { notifyCalendarUsers } from './calendar.notifications'

export async function inviteParticipantsUseCase(
  params: { userId: number, permissions: string[], eventId: number, input: InviteParticipantsInput },
  deps: { calendarRepository: CalendarRepository, teamsRepository: TeamsRepository }
): Promise<CalendarEventDTO> {
  if (!params.permissions.includes(PERMISSIONS.CALENDAR_INVITE)) {
    throw new ForbiddenError('Insufficient permissions')
  }

  const event = await deps.calendarRepository.findEventById(params.eventId)
  if (!event) {
    throw new NotFoundError('Calendar event not found')
  }

  await assertCanAccessEventUseCase(
    { userId: params.userId, permissions: params.permissions, event, action: 'invite' },
    { teamsRepository: deps.teamsRepository }
  )

  let allowedUserIds = new Set(params.input.user_ids)
  if (event.teamId) {
    const members = await deps.teamsRepository.listMembers(event.teamId)
    const memberIds = new Set(members.map(member => member.userId))
    allowedUserIds = new Set(params.input.user_ids.filter(userId => memberIds.has(userId)))
  }

  if (allowedUserIds.size === 0) {
    throw new ValidationError('No valid participants to invite')
  }

  await deps.calendarRepository.addParticipants(
    Array.from(allowedUserIds).map(userId => ({
      eventId: event.id,
      userId,
      role: 'attendee',
      rsvpStatus: 'invited',
      invitedById: params.userId
    }))
  )

  const participants = await deps.calendarRepository.listParticipants(event.id)
  const reminders = await deps.calendarRepository.listReminders(event.id)
  await notifyCalendarUsers({
    action: 'calendar.event.invited',
    event,
    actorId: params.userId,
    recipientIds: Array.from(allowedUserIds)
  })
  return toCalendarEventDTO(event, participants, reminders)
}
