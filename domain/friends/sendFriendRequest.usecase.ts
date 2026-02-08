import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import { FriendBlockedError, FriendRequestConflictError, FriendSelfInviteError } from './errors'

export async function sendFriendRequestUseCase(
  senderId: number,
  receiverId: number,
  message: string | null,
  friendsRepository: FriendsRepository
) {
  if (senderId === receiverId) {
    throw new FriendSelfInviteError()
  }

  const existing = await friendsRepository.findRequestBetweenUsers(senderId, receiverId)
  if (existing) {
    if (existing.status === 'blocked') {
      throw new FriendBlockedError()
    }

    if (existing.status === 'accepted') {
      throw new FriendRequestConflictError('ALREADY_FRIENDS')
    }

    if (existing.status === 'pending') {
      if (existing.senderId === senderId) {
        throw new FriendRequestConflictError('REQUEST_PENDING')
      }

      const updated = await friendsRepository.updateRequest(existing.id, {
        status: 'accepted'
      })
      return { request: updated, autoAccepted: true }
    }

    if (existing.status === 'declined' || existing.status === 'canceled') {
      const updated = await friendsRepository.updateRequest(existing.id, {
        senderId,
        receiverId,
        status: 'pending',
        message
      })
      return { request: updated, autoAccepted: false }
    }
  }

  const request = await friendsRepository.createRequest({
    senderId,
    receiverId,
    message,
    status: 'pending'
  })

  return { request, autoAccepted: false }
}
