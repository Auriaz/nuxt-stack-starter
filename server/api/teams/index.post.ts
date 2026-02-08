import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { CreateTeamInputSchema } from '#shared/schemas/teams'
import { createTeamUseCase } from '~~/domain/teams/createTeam.usecase'
import { teamsRepository } from '~~/server/repositories/teams.repo'
import { createNotification } from '~~/server/utils/notifications'

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
  if (!permissions.includes(PERMISSIONS.TEAMS_CREATE)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const body = await readBody(event)
  const parsed = safeParse(CreateTeamInputSchema, body)
  if (!parsed.success) {
    throw createError({ status: 422, statusText: 'Validation error', data: { error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', issues: parsed.issues } } })
  }

  const team = await createTeamUseCase(userId, parsed.output, teamsRepository)
  await createNotification({
    userId,
    type: 'success',
    title: 'Utworzono zespol',
    message: `Zespol ${team.name} jest gotowy do pracy.`,
    actionUrl: '/dashboard/teams'
  })
  return { data: toTeamDto(team) }
})
