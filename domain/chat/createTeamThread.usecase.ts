import { PERMISSIONS } from '#shared/permissions'
import type { ChatRepository, ChatThreadRecord } from '~~/server/repositories/chat.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { ChatAccessDeniedError } from './errors'

function hasPermission(permissions: string[], key: string, fallback?: string) {
  if (permissions.includes(key)) return true
  if (fallback && permissions.includes(fallback)) return true
  return false
}

export async function createTeamThreadUseCase(
  userId: number,
  teamId: number,
  input: { title?: string | null },
  permissions: string[],
  teamsRepository: TeamsRepository,
  chatRepository: ChatRepository
): Promise<ChatThreadRecord> {
  if (!hasPermission(permissions, PERMISSIONS.CHAT_USE)) {
    throw new ChatAccessDeniedError('Chat access denied')
  }

  if (!hasPermission(permissions, PERMISSIONS.CHAT_TEAM_WRITE, PERMISSIONS.CHAT_USE)) {
    throw new ChatAccessDeniedError('Insufficient permissions')
  }

  const member = await teamsRepository.findMember(teamId, userId)
  if (!member) {
    throw new ChatAccessDeniedError('Not a team member')
  }

  const thread = await chatRepository.createThread({
    type: 'team',
    title: input.title ?? null,
    createdById: userId,
    teamId
  })

  await chatRepository.createParticipant({ threadId: thread.id, userId, role: 'owner' })

  return thread
}
