import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { UpdateTeamInputSchema } from '#shared/schemas/teams'
import { teamsRepository } from '~~/server/repositories/teams.repo'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

function isManager(role: string) {
  return role === 'owner' || role === 'admin'
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
  if (!permissions.includes(PERMISSIONS.TEAMS_MANAGE)) {
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

  const body = await readBody(event)
  const parsed = safeParse(UpdateTeamInputSchema, body)
  if (!parsed.success) {
    throw createError({ status: 422, statusText: 'Validation error', data: { error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', issues: parsed.issues } } })
  }

  const team = await teamsRepository.updateTeam(teamId, { name: parsed.output.name ?? null })
  return { data: toTeamDto(team) }
})
