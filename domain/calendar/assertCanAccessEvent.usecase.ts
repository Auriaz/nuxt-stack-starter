import { PERMISSIONS } from '#shared/permissions'
import type { CalendarEventRecord } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { ForbiddenError } from '../shared/errors'

export type CalendarAccessAction = 'read' | 'write' | 'invite'

function hasPermission(permissions: string[], key: string, fallback?: string) {
  if (permissions.includes(key)) return true
  if (fallback && permissions.includes(fallback)) return true
  return false
}

export async function assertCanAccessEventUseCase(
  params: { userId: number, permissions: string[], event: CalendarEventRecord, action: CalendarAccessAction },
  deps: { teamsRepository: TeamsRepository }
): Promise<void> {
  const { userId, permissions, event, action } = params

  if (permissions.includes(PERMISSIONS.CALENDAR_ADMIN)) return

  if (event.ownerId === userId) return

  if (event.teamId) {
    const member = await deps.teamsRepository.findMember(event.teamId, userId)
    if (!member) {
      throw new ForbiddenError('Not a team member')
    }

    if (action === 'read') {
      if (!hasPermission(permissions, PERMISSIONS.CALENDAR_TEAM_READ, PERMISSIONS.CALENDAR_READ)) {
        throw new ForbiddenError('Insufficient permissions')
      }
      return
    }

    if (action === 'write' || action === 'invite') {
      if (!hasPermission(permissions, PERMISSIONS.CALENDAR_TEAM_WRITE, PERMISSIONS.CALENDAR_WRITE)) {
        throw new ForbiddenError('Insufficient permissions')
      }

      if (!['owner', 'admin'].includes(member.role)) {
        throw new ForbiddenError('Insufficient team role')
      }
      return
    }
  }

  if (action === 'read') {
    if (!hasPermission(permissions, PERMISSIONS.CALENDAR_READ)) {
      throw new ForbiddenError('Insufficient permissions')
    }
    return
  }

  if (!hasPermission(permissions, PERMISSIONS.CALENDAR_WRITE)) {
    throw new ForbiddenError('Insufficient permissions')
  }
}
