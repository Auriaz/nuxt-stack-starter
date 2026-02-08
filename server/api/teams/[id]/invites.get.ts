import { PERMISSIONS } from '#shared/permissions'
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
  if (!permissions.includes(PERMISSIONS.TEAMS_READ)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const teamId = parseId(getRouterParam(event, 'id'))
  if (!teamId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid team id' } } })
  }

  const member = await teamsRepository.findMember(teamId, userId)
  if (!member || !isManager(member.role)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient role' } } })
  }

  const invites = await teamsRepository.listInvites(teamId)
  const data = invites.map(invite => ({
    id: invite.id,
    team_id: invite.teamId,
    inviter_id: invite.inviterId,
    invitee_id: invite.inviteeId,
    status: invite.status,
    created_at: invite.createdAt.toISOString(),
    updated_at: invite.updatedAt.toISOString(),
    responded_at: invite.respondedAt?.toISOString(),
    inviter: invite.inviter
      ? {
          id: invite.inviter.id,
          username: invite.inviter.username,
          email: invite.inviter.email,
          name: invite.inviter.name ?? undefined,
          avatar_url: invite.inviter.avatarUrl ?? undefined
        }
      : undefined,
    invitee: invite.invitee
      ? {
          id: invite.invitee.id,
          username: invite.invitee.username,
          email: invite.invitee.email,
          name: invite.invitee.name ?? undefined,
          avatar_url: invite.invitee.avatarUrl ?? undefined
        }
      : undefined,
    team: invite.team
      ? {
          id: invite.team.id,
          name: invite.team.name,
          slug: invite.team.slug ?? undefined
        }
      : undefined
  }))

  return { data: { invites: data } }
})
