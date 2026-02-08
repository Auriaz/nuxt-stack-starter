import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import { FriendRequestNotFoundError } from './errors'

export async function unblockUserUseCase(
  userId: number,
  targetUserId: number,
  friendsRepository: FriendsRepository
) {
  const requests = await friendsRepository.listRequestsBetweenUsers(userId, targetUserId)
  if (requests.length === 0) throw new FriendRequestNotFoundError()

  const blocked = requests.find(request => request.status === 'blocked' && request.senderId === userId)
  if (!blocked) {
    return { request: requests[0], changed: false }
  }

  const nextStatus = blocked.previousStatus === 'accepted' ? 'accepted' : 'canceled'
  const updated = await friendsRepository.updateRequest(blocked.id, { status: nextStatus, previousStatus: null })
  return { request: updated, changed: true }
}
