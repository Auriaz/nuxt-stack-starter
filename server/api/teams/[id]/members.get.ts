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

  const teamId = parseId(getRouterParam(event, 'id'))
  if (!teamId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid team id' } } })
  }

  const member = await teamsRepository.findMember(teamId, userId)
  if (!member) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Not a team member' } } })
  }

  const members = await teamsRepository.listMembers(teamId)
  const data = members.map(item => ({
    id: item.id,
    team_id: item.teamId,
    user_id: item.userId,
    role: item.role,
    joined_at: item.joinedAt.toISOString(),
    user: item.user
      ? {
          id: item.user.id,
          username: item.user.username,
          email: item.user.email,
          name: item.user.name ?? undefined,
          avatar_url: item.user.avatarUrl ?? undefined
        }
      : undefined
  }))

  return { data: { members: data } }
})
