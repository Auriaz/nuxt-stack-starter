import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { TeamAccessDeniedError, TeamMemberNotFoundError, TeamRoleForbiddenError } from './errors'

function isManager(role: string) {
  return role === 'owner' || role === 'admin'
}

export async function removeMemberUseCase(
  teamId: number,
  actorId: number,
  targetUserId: number,
  teamsRepository: TeamsRepository
) {
  const actor = await teamsRepository.findMember(teamId, actorId)
  if (!actor || !isManager(actor.role)) {
    throw new TeamAccessDeniedError()
  }

  const target = await teamsRepository.findMember(teamId, targetUserId)
  if (!target) throw new TeamMemberNotFoundError()

  if (target.role === 'owner') {
    throw new TeamRoleForbiddenError('Cannot remove owner')
  }

  if (actor.role === 'admin' && target.role === 'admin') {
    throw new TeamRoleForbiddenError('Admin cannot remove admin')
  }

  await teamsRepository.removeMember(teamId, targetUserId)
}
