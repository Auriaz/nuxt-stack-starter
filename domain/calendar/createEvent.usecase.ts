import { PERMISSIONS } from '#shared/permissions'
import type { CalendarEventDTO, CreateCalendarEventInput } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { ForbiddenError, ValidationError } from '../shared/errors'
import { toCalendarEventDTO } from './calendar.mapper'
import { notifyCalendarEventChange } from './calendar.notifications'

function hasPermission(permissions: string[], key: string, fallback?: string) {
  if (permissions.includes(key)) return true
  if (fallback && permissions.includes(fallback)) return true
  return false
}

function parseDate(value: string, label: string): Date {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`Invalid ${label} date`)
  }
  return date
}

export async function createEventUseCase(
  params: { userId: number, permissions: string[], input: CreateCalendarEventInput },
  deps: { calendarRepository: CalendarRepository, teamsRepository: TeamsRepository }
): Promise<CalendarEventDTO> {
  const { input } = params

  const startAt = parseDate(input.start_at, 'start_at')
  const endAt = parseDate(input.end_at, 'end_at')
  if (startAt >= endAt) {
    throw new ValidationError('Invalid date range')
  }

  let teamId: number | null = null
  if (typeof input.team_id === 'number') {
    teamId = input.team_id
  }

  if (teamId) {
    if (!hasPermission(params.permissions, PERMISSIONS.CALENDAR_TEAM_WRITE, PERMISSIONS.CALENDAR_WRITE)) {
      throw new ForbiddenError('Insufficient permissions')
    }

    const member = await deps.teamsRepository.findMember(teamId, params.userId)
    if (!member) {
      throw new ForbiddenError('Not a team member')
    }

    // All team members (owner, admin, member) can create events
    if (!['owner', 'admin', 'member'].includes(member.role)) {
      throw new ForbiddenError('Insufficient team role')
    }
  } else {
    if (!hasPermission(params.permissions, PERMISSIONS.CALENDAR_WRITE)) {
      throw new ForbiddenError('Insufficient permissions')
    }
  }

  const event = await deps.calendarRepository.createEvent({
    ownerId: params.userId,
    teamId,
    categoryId: typeof input.category_id === 'number' ? input.category_id : null,
    title: input.title,
    description: input.description ?? null,
    startAt,
    endAt,
    timezone: input.timezone,
    location: input.location ?? null,
    url: input.url ?? null,
    visibility: input.visibility ?? (teamId ? 'team' : 'private')
  })

  const participantIds = new Set<number>(input.participant_ids ?? [])
  participantIds.add(params.userId)

  const participants = await deps.calendarRepository.addParticipants(
    Array.from(participantIds).map(userId => ({
      eventId: event.id,
      userId,
      role: userId === params.userId ? 'owner' : 'attendee',
      rsvpStatus: userId === params.userId ? 'accepted' : 'invited',
      invitedById: userId === params.userId ? null : params.userId
    }))
  )

  if (typeof input.reminder_minutes === 'number') {
    await deps.calendarRepository.clearReminders(event.id)
    await deps.calendarRepository.addReminder(event.id, input.reminder_minutes, 'in_app')
  }

  const reminders = await deps.calendarRepository.listReminders(event.id)
  await notifyCalendarEventChange({
    action: 'calendar.event.created',
    event,
    actorId: params.userId,
    participants,
    teamsRepository: deps.teamsRepository
  })
  return toCalendarEventDTO(event, participants, reminders)
}
