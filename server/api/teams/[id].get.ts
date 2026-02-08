import { PERMISSIONS } from '#shared/permissions'
import { teamsRepository } from '~~/server/repositories/teams.repo'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

function toTeamDto(team: { id: number, name: string, slug: string | null, ownerId: number, createdAt: Date, updatedAt: Date }) {
  return {
    id: team.id,
    name: team.name,
    slug: team.slug ?? undefined,
    owner_id: team.ownerId,
    created_at: team.createdAt.toISOString(),
    updated_at: team.updatedAt.toISOString()
  }
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

  const team = await teamsRepository.findTeamById(teamId)
  if (!team) {
    throw createError({ status: 404, statusText: 'Not found', data: { error: { code: 'NOT_FOUND', message: 'Team not found' } } })
  }

  const member = await teamsRepository.findMember(teamId, userId)
  if (!member) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Not a team member' } } })
  }

  return { data: toTeamDto(team) }
})
