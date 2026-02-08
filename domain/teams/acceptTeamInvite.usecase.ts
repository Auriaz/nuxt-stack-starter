import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { TeamAccessDeniedError, TeamInviteConflictError, TeamInviteNotFoundError } from './errors'

export async function acceptTeamInviteUseCase(
  inviteId: number,
  userId: number,
  teamsRepository: TeamsRepository
) {
  const invite = await teamsRepository.findInviteById(inviteId)
  if (!invite) throw new TeamInviteNotFoundError()

  if (invite.inviteeId !== userId) {
    throw new TeamAccessDeniedError()
  }

  if (invite.status === 'accepted') {
    return { invite, changed: false }
  }

  if (invite.status !== 'pending') {
    throw new TeamInviteConflictError('INVALID_STATUS')
  }

  const existingAccepted = await teamsRepository.findInviteByTeamInviteeStatus(invite.teamId, userId, 'accepted')
  if (existingAccepted && existingAccepted.id !== invite.id) {
    return { invite: existingAccepted, changed: false }
  }

  const existingMember = await teamsRepository.findMember(invite.teamId, userId)
  if (!existingMember) {
    await teamsRepository.createMember({ teamId: invite.teamId, userId, role: 'member' })
  }

  const updated = await teamsRepository.updateInviteStatus(invite.id, 'accepted', new Date())
  return { invite: updated, changed: true }
}
