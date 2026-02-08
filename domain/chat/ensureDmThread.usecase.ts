import type { ChatRepository, ChatThreadRecord } from '~~/server/repositories/chat.repo'

function buildDmKey(userA: number, userB: number) {
  const [low, high] = userA < userB ? [userA, userB] : [userB, userA]
  return `${low}:${high}`
}

export async function ensureDmThreadUseCase(
  userA: number,
  userB: number,
  chatRepository: ChatRepository
): Promise<ChatThreadRecord> {
  const dmKey = buildDmKey(userA, userB)
  const existing = await chatRepository.findDmThreadByKey(dmKey)
  if (existing) return existing

  const legacy = await chatRepository.findDmThreadByUsers(userA, userB)
  if (legacy) return legacy

  const thread = await chatRepository.createThread({
    type: 'dm',
    dmKey
  })

  await chatRepository.createParticipant({ threadId: thread.id, userId: userA })
  await chatRepository.createParticipant({ threadId: thread.id, userId: userB })

  return thread
}
