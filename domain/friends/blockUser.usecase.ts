import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import { FriendSelfInviteError } from './errors'

export async function blockUserUseCase(
  userId: number,
  targetUserId: number,
  friendsRepository: FriendsRepository
) {
  if (userId === targetUserId) {
    throw new FriendSelfInviteError()
  }

  const requests = await friendsRepository.listRequestsBetweenUsers(userId, targetUserId)
  const current = requests.find(request => request.senderId === userId && request.receiverId === targetUserId)
  if (current?.status === 'blocked') {
    return current
  }

  const target = current ?? requests[0]
  if (target) {
    return await friendsRepository.updateRequest(target.id, {
      senderId: userId,
      receiverId: targetUserId,
      status: 'blocked',
      previousStatus: target.status === 'blocked' ? target.previousStatus ?? undefined : target.status
    })
  }

  return await friendsRepository.createRequest({
    senderId: userId,
    receiverId: targetUserId,
    status: 'blocked'
  })
}
