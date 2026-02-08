import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { TeamAccessDeniedError, TeamInviteConflictError, TeamNotFoundError } from './errors'

function isManager(role: string) {
  return role === 'owner' || role === 'admin'
}

export async function inviteToTeamUseCase(
  teamId: number,
  inviterId: number,
  inviteeId: number,
  teamsRepository: TeamsRepository
) {
  const team = await teamsRepository.findTeamById(teamId)
  if (!team) throw new TeamNotFoundError()

  const inviter = await teamsRepository.findMember(teamId, inviterId)
  if (!inviter || !isManager(inviter.role)) {
    throw new TeamAccessDeniedError()
  }

  const existingMember = await teamsRepository.findMember(teamId, inviteeId)
  if (existingMember) {
    throw new TeamInviteConflictError('ALREADY_MEMBER')
  }

  const pending = await teamsRepository.findPendingInvite(teamId, inviteeId)
  if (pending) {
    throw new TeamInviteConflictError('INVITE_PENDING')
  }

  return await teamsRepository.createInvite({ teamId, inviterId, inviteeId })
}
