import type { ChatRepository } from '~~/server/repositories/chat.repo'
import { ChatAccessDeniedError, ChatThreadNotFoundError } from './errors'

export async function markThreadReadUseCase(
  userId: number,
  threadId: number,
  chatRepository: ChatRepository,
  readAt = new Date()
): Promise<{ threadId: number, userId: number, lastReadAt: Date }> {
  const thread = await chatRepository.findThreadById(threadId)
  if (!thread) {
    throw new ChatThreadNotFoundError()
  }

  const participant = await chatRepository.findParticipant(threadId, userId)
  if (!participant) {
    throw new ChatAccessDeniedError('User is not a participant')
  }

  await chatRepository.updateParticipantLastReadAt(threadId, userId, readAt)

  return { threadId, userId, lastReadAt: readAt }
}
