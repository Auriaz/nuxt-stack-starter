import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { TeamAccessDeniedError, TeamInviteConflictError, TeamInviteNotFoundError } from './errors'

function isManager(role: string) {
  return role === 'owner' || role === 'admin'
}

export async function cancelTeamInviteUseCase(
  inviteId: number,
  userId: number,
  teamsRepository: TeamsRepository
) {
  const invite = await teamsRepository.findInviteById(inviteId)
  if (!invite) throw new TeamInviteNotFoundError()

  if (invite.status !== 'pending') {
    throw new TeamInviteConflictError('INVALID_STATUS')
  }

  if (invite.inviterId !== userId) {
    const member = await teamsRepository.findMember(invite.teamId, userId)
    if (!member || !isManager(member.role)) {
      throw new TeamAccessDeniedError()
    }
  }

  return await teamsRepository.updateInviteStatus(invite.id, 'canceled', new Date())
}
