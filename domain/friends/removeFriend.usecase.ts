import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import { FriendRequestConflictError, FriendRequestNotFoundError } from './errors'

export async function removeFriendUseCase(
  userId: number,
  targetUserId: number,
  friendsRepository: FriendsRepository
) {
  const existing = await friendsRepository.findRequestBetweenUsers(userId, targetUserId)
  if (!existing) throw new FriendRequestNotFoundError()

  if (existing.status !== 'accepted') {
    throw new FriendRequestConflictError('NOT_FRIENDS')
  }

  return await friendsRepository.updateRequest(existing.id, { status: 'canceled' })
}
