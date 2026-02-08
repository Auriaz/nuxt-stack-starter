import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { TeamAccessDeniedError, TeamInviteConflictError, TeamInviteNotFoundError } from './errors'

export async function declineTeamInviteUseCase(
  inviteId: number,
  userId: number,
  teamsRepository: TeamsRepository
) {
  const invite = await teamsRepository.findInviteById(inviteId)
  if (!invite) throw new TeamInviteNotFoundError()

  if (invite.inviteeId !== userId) {
    throw new TeamAccessDeniedError()
  }

  if (invite.status === 'declined') {
    return { invite, changed: false }
  }

  if (invite.status !== 'pending') {
    throw new TeamInviteConflictError('INVALID_STATUS')
  }

  const existingDeclined = await teamsRepository.findInviteByTeamInviteeStatus(invite.teamId, userId, 'declined')
  if (existingDeclined && existingDeclined.id !== invite.id) {
    return { invite: existingDeclined, changed: false }
  }

  const updated = await teamsRepository.updateInviteStatus(invite.id, 'declined', new Date())
  return { invite: updated, changed: true }
}
