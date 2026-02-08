import { PERMISSIONS } from '#shared/permissions'
import { listTeamsForUserUseCase } from '~~/domain/teams/listTeamsForUser.usecase'
import { teamsRepository } from '~~/server/repositories/teams.repo'

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

  const items = await listTeamsForUserUseCase(userId, teamsRepository)
  return { data: { teams: items.map(toTeamDto) } }
})
