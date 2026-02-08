import { PERMISSIONS } from '#shared/permissions'
import { teamsRepository } from '~~/server/repositories/teams.repo'
import { createNotification } from '~~/server/utils/notifications'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

function isOwner(role: string) {
  return role === 'owner'
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
  if (!member || !isOwner(member.role)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient role' } } })
  }

  const [team, members] = await Promise.all([
    teamsRepository.findTeamById(teamId),
    teamsRepository.listMembers(teamId)
  ])

  await teamsRepository.deleteTeam(teamId)

  const teamLabel = team?.name || 'zespol'
  const targets = members.filter(member => member.userId !== userId)
  await Promise.all(
    targets.map(member => createNotification({
      userId: member.userId,
      type: 'warning',
      title: 'Zespol usuniety',
      message: `Zespol ${teamLabel} zostal usuniety.`,
      actionUrl: '/dashboard/teams'
    }))
  )
  return { data: { deleted: true } }
})
