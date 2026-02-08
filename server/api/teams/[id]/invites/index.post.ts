import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { TeamInviteInputSchema } from '#shared/schemas/teams'
import { inviteToTeamUseCase } from '~~/domain/teams/inviteToTeam.usecase'
import { TeamAccessDeniedError, TeamInviteConflictError, TeamNotFoundError } from '~~/domain/teams/errors'
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
  if (!permissions.includes(PERMISSIONS.TEAMS_MANAGE)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const teamId = parseId(getRouterParam(event, 'id'))
  if (!teamId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid team id' } } })
  }

  const body = await readBody(event)
  const parsed = safeParse(TeamInviteInputSchema, body)
  if (!parsed.success) {
    throw createError({ status: 422, statusText: 'Validation error', data: { error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', issues: parsed.issues } } })
  }

  try {
    const invite = await inviteToTeamUseCase(teamId, userId, parsed.output.invitee_id, teamsRepository)
    const team = await teamsRepository.findTeamById(teamId)
    const inviterName = invite.inviter?.name || invite.inviter?.username || 'Uzytkownik'
    const teamLabel = team?.name || 'zespolu'
    await createNotification({
      userId: invite.inviteeId,
      type: 'info',
      title: 'Zaproszenie do zespolu',
      message: `${inviterName} zaprosil(a) Cie do zespolu ${teamLabel}.`,
      actionUrl: '/dashboard/teams'
    })
    return { data: { invite_id: invite.id, status: invite.status } }
  } catch (err) {
    if (err instanceof TeamNotFoundError) {
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
