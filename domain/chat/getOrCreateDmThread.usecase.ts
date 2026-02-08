import type { ChatRepository, ChatThreadRecord } from '~~/server/repositories/chat.repo'
import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import { ChatAccessDeniedError } from './errors'
import { ensureDmThreadUseCase } from './ensureDmThread.usecase'

export async function getOrCreateDmThreadUseCase(
  userId: number,
  otherUserId: number,
  friendsRepository: FriendsRepository,
  chatRepository: ChatRepository
): Promise<ChatThreadRecord> {
  if (userId === otherUserId) {
    throw new ChatAccessDeniedError('Cannot open DM with self')
  }

  const friendship = await friendsRepository.findRequestBetweenUsers(userId, otherUserId)
  if (!friendship) {
    throw new ChatAccessDeniedError('Friendship required')
  }

  if (friendship.status === 'blocked') {
    throw new ChatAccessDeniedError('User blocked')
  }

  if (friendship.status !== 'accepted') {
    throw new ChatAccessDeniedError('Friendship required')
  }

  return await ensureDmThreadUseCase(userId, otherUserId, chatRepository)
}
