import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import { FriendAccessDeniedError, FriendRequestConflictError, FriendRequestNotFoundError } from './errors'

export async function declineFriendRequestUseCase(
  requestId: number,
  userId: number,
  friendsRepository: FriendsRepository
) {
  const request = await friendsRepository.findRequestById(requestId)
  if (!request) throw new FriendRequestNotFoundError()

  if (request.receiverId !== userId) {
    throw new FriendAccessDeniedError()
  }

  if (request.status !== 'pending') {
    throw new FriendRequestConflictError('INVALID_STATUS')
  }

  return await friendsRepository.updateRequest(request.id, { status: 'declined' })
}
