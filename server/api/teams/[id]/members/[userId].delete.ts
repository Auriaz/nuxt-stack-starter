import { PERMISSIONS } from '#shared/permissions'
import { removeMemberUseCase } from '~~/domain/teams/removeMember.usecase'
import { TeamAccessDeniedError, TeamMemberNotFoundError, TeamRoleForbiddenError } from '~~/domain/teams/errors'
import { teamsRepository } from '~~/server/repositories/teams.repo'
import { createNotification } from '~~/server/utils/notifications'

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
  if (!permissions.includes(PERMISSIONS.TEAMS_MEMBERS_MANAGE)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const teamId = parseId(getRouterParam(event, 'id'))
  const targetId = parseId(getRouterParam(event, 'userId'))
  if (!teamId || !targetId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid id' } } })
  }

  try {
    await removeMemberUseCase(teamId, userId, targetId, teamsRepository)
    const team = await teamsRepository.findTeamById(teamId)
    const teamLabel = team?.name || 'zespol'
    await createNotification({
      userId: targetId,
      type: 'warning',
      title: 'Usunieto z zespolu',
      message: `Zostales usuniety z zespolu ${teamLabel}.`,
      actionUrl: '/dashboard/teams'
    })
    return { data: { ok: true } }
  } catch (err) {
    if (err instanceof TeamAccessDeniedError) {
      throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: err.message } } })
    }
    if (err instanceof TeamMemberNotFoundError) {
      throw createError({ status: 404, statusText: 'Not found', data: { error: { code: 'NOT_FOUND', message: err.message } } })
    }
    if (err instanceof TeamRoleForbiddenError) {
      throw createError({ status: 409, statusText: 'Conflict', data: { error: { code: 'ROLE_FORBIDDEN', message: err.message } } })
    }
    throw err
  }
})
