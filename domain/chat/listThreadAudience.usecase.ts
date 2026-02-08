import type { ChatRepository, ChatThreadRecord } from '~~/server/repositories/chat.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'

export async function listThreadAudienceUserIdsUseCase(
  thread: ChatThreadRecord,
  deps: { chatRepository: ChatRepository, teamsRepository: TeamsRepository }
): Promise<number[]> {
  if (thread.type === 'team' && thread.teamId) {
    const members = await deps.teamsRepository.listMembers(thread.teamId)
    const userIds = members.map(member => member.userId)
    return Array.from(new Set(userIds))
  }

  return await deps.chatRepository.listParticipantUserIds(thread.id)
}
