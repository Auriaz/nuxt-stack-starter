import type { ChatRepository, ChatThreadRecord } from '~~/server/repositories/chat.repo'

export async function ensureDmThreadUseCase(
  userA: number,
  userB: number,
  chatRepository: ChatRepository
): Promise<ChatThreadRecord> {
  const existing = await chatRepository.findDmThreadByUsers(userA, userB)
  if (existing) return existing

  const thread = await chatRepository.createThread({
    type: 'dm'
  })

  await chatRepository.createParticipant({ threadId: thread.id, userId: userA })
  await chatRepository.createParticipant({ threadId: thread.id, userId: userB })

  return thread
}
