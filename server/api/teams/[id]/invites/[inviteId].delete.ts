import { PERMISSIONS } from '#shared/permissions'
import { TeamAccessDeniedError, TeamInviteNotFoundError } from '~~/domain/teams/errors'
import { teamsRepository } from '~~/server/repositories/teams.repo'

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
  if (!permissions.includes(PERMISSIONS.TEAMS_MANAGE)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const teamId = parseId(getRouterParam(event, 'id'))
  const inviteId = parseId(getRouterParam(event, 'inviteId'))
  if (!teamId || !inviteId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid team or invite id' } } })
  }

  try {
    const member = await teamsRepository.findMember(teamId, userId)
    if (!member || !isManager(member.role)) {
      throw new TeamAccessDeniedError()
    }

    const invite = await teamsRepository.findInviteById(inviteId)
    if (!invite || invite.teamId !== teamId) {
      throw new TeamInviteNotFoundError()
    }

    await teamsRepository.deleteInvite(inviteId)
    return { data: { deleted: true } }
  } catch (err) {
    if (err instanceof TeamInviteNotFoundError) {
      throw createError({ status: 404, statusText: 'Not found', data: { error: { code: 'NOT_FOUND', message: err.message } } })
    }
    if (err instanceof TeamAccessDeniedError) {
      throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: err.message } } })
    }
    throw err
  }
})
