import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { TeamAccessDeniedError, TeamMemberNotFoundError, TeamRoleForbiddenError } from './errors'

export async function changeMemberRoleUseCase(
  teamId: number,
  actorId: number,
  targetUserId: number,
  role: string,
  teamsRepository: TeamsRepository
) {
  const actor = await teamsRepository.findMember(teamId, actorId)
  if (!actor || actor.role !== 'owner') {
    throw new TeamAccessDeniedError()
  }

  const target = await teamsRepository.findMember(teamId, targetUserId)
  if (!target) throw new TeamMemberNotFoundError()

  if (target.role === 'owner') {
    throw new TeamRoleForbiddenError('Cannot change owner role')
  }

  if (role === 'owner') {
    throw new TeamRoleForbiddenError('Owner transfer not supported in MVP')
  }

  return await teamsRepository.updateMemberRole(teamId, targetUserId, role)
}
