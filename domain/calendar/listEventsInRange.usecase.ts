import { PERMISSIONS } from '#shared/permissions'
import type { CalendarRangeQuery, CalendarEventListDTO } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { ForbiddenError, ValidationError } from '../shared/errors'
import { toCalendarEventListItemDTO } from './calendar.mapper'

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

export async function listEventsInRangeUseCase(
  userId: number,
  permissions: string[],
  query: CalendarRangeQuery,
  deps: { calendarRepository: CalendarRepository, teamsRepository: TeamsRepository }
): Promise<CalendarEventListDTO> {
  const from = parseDate(query.from, 'from')
  const to = parseDate(query.to, 'to')

  if (from > to) {
    throw new ValidationError('Invalid date range')
  }

  if (query.scope === 'personal') {
    if (!hasPermission(permissions, PERMISSIONS.CALENDAR_READ)) {
      throw new ForbiddenError('Insufficient permissions')
    }
    const items = await deps.calendarRepository.listEventsForOwnerInRange(userId, from, to)
    return { items: items.map(toCalendarEventListItemDTO) }
  }

  if (query.scope === 'team') {
    if (!hasPermission(permissions, PERMISSIONS.CALENDAR_TEAM_READ, PERMISSIONS.CALENDAR_READ)) {
      throw new ForbiddenError('Insufficient permissions')
    }

    const teamId = query.team_id ? Number(query.team_id) : NaN
    if (!teamId || Number.isNaN(teamId)) {
      throw new ValidationError('Missing team_id')
    }

    const member = await deps.teamsRepository.findMember(teamId, userId)
    if (!member) {
      throw new ForbiddenError('Not a team member')
    }

    const items = await deps.calendarRepository.listEventsForTeamInRange(teamId, from, to)
    return { items: items.map(toCalendarEventListItemDTO) }
  }

  if (!hasPermission(permissions, PERMISSIONS.CALENDAR_READ)) {
    throw new ForbiddenError('Insufficient permissions')
  }

  if (!hasPermission(permissions, PERMISSIONS.CALENDAR_TEAM_READ, PERMISSIONS.CALENDAR_READ)) {
    throw new ForbiddenError('Insufficient permissions')
  }

  const teams = await deps.teamsRepository.listTeamsForUser(userId)
  const teamIds = teams.map(team => team.id)

  const [personal, team] = await Promise.all([
    deps.calendarRepository.listEventsForOwnerInRange(userId, from, to),
    teamIds.length ? deps.calendarRepository.listEventsForTeamsInRange(teamIds, from, to) : Promise.resolve([])
  ])

  const items = [...personal, ...team].map(toCalendarEventListItemDTO)
  return { items }
}
