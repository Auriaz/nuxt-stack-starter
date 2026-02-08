import { PERMISSIONS } from '#shared/permissions'
import { acceptTeamInviteUseCase } from '~~/domain/teams/acceptTeamInvite.usecase'
import { TeamAccessDeniedError, TeamInviteConflictError, TeamInviteNotFoundError } from '~~/domain/teams/errors'
import { teamsRepository } from '~~/server/repositories/teams.repo'
import { createNotification } from '~~/server/utils/notifications'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

function isManager(role: string) {
  return role === 'owner' || role === 'admin'
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id
  if (!userId) {
    throw createError({ status: 401, statusText: 'Unauthorized', data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } } })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.TEAMS_READ)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const inviteId = parseId(getRouterParam(event, 'inviteId'))
  if (!inviteId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid invite id' } } })
  }

  try {
    const result = await acceptTeamInviteUseCase(inviteId, userId, teamsRepository)
    const invite = result.invite
    if (result.changed) {
      const team = await teamsRepository.findTeamById(invite.teamId)
      const inviteeName = invite.invitee?.name || invite.invitee?.username || 'Uzytkownik'
      const teamLabel = team?.name || 'zespolu'
      const members = await teamsRepository.listMembers(invite.teamId)
      const managerIds = members.filter(member => isManager(member.role)).map(member => member.userId)
      await Promise.all(
        managerIds.map(managerId => createNotification({
          userId: managerId,
          type: 'success',
          title: 'Zaproszenie zaakceptowane',
          message: `${inviteeName} dolaczyl(a) do zespolu ${teamLabel}.`,
          actionUrl: `/dashboard/teams/${invite.teamId}`
        }))
      )
    }
    return { data: { invite_id: invite.id, status: invite.status } }
  } catch (err) {
    if (err instanceof TeamInviteNotFoundError) {
      throw createError({ status: 404, statusText: 'Not found', data: { error: { code: 'NOT_FOUND', message: err.message } } })
    }
    if (err instanceof TeamAccessDeniedError) {
      throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: err.message } } })
    }
    if (err instanceof TeamInviteConflictError) {
      throw createError({ status: 409, statusText: 'Conflict', data: { error: { code: err.reason, message: err.message } } })
    }
    throw err
  }
})
