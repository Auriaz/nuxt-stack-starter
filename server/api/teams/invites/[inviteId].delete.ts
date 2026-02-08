import { PERMISSIONS } from '#shared/permissions'
import { teamsRepository } from '~~/server/repositories/teams.repo'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
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

  const invite = await teamsRepository.findInviteById(inviteId)
  if (!invite || invite.inviteeId !== userId) {
    throw createError({ status: 404, statusText: 'Not found', data: { error: { code: 'NOT_FOUND', message: 'Invite not found' } } })
  }

  if (invite.status !== 'declined') {
    throw createError({ status: 409, statusText: 'Conflict', data: { error: { code: 'INVALID_STATUS', message: 'Invite cannot be removed' } } })
  }

  await teamsRepository.deleteInvite(inviteId)
  return { data: { deleted: true } }
})
