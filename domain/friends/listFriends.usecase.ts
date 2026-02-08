import type { FriendsRepository } from '~~/server/repositories/friends.repo'
import type { FriendUserSummaryDTO, FriendRequestDTO, FriendsListDTO } from '#shared/types/friends'

function toUserSummary(record: { id: number, username: string, email: string, name: string | null, avatarUrl: string | null }): FriendUserSummaryDTO {
  return {
    id: record.id,
    username: record.username,
    email: record.email,
    name: record.name ?? undefined,
    avatar_url: record.avatarUrl ?? undefined
  }
}

function toRequestDTO(record: { id: number, senderId: number, receiverId: number, status: string, message: string | null, createdAt: Date, updatedAt: Date, sender: { id: number, username: string, email: string, name: string | null, avatarUrl: string | null }, receiver: { id: number, username: string, email: string, name: string | null, avatarUrl: string | null } }): FriendRequestDTO {
  return {
    id: record.id,
    sender_id: record.senderId,
    receiver_id: record.receiverId,
    status: record.status as FriendRequestDTO['status'],
    message: record.message ?? undefined,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString(),
    sender: toUserSummary(record.sender),
    receiver: toUserSummary(record.receiver)
  }
}

export async function listFriendsUseCase(
  userId: number,
  friendsRepository: FriendsRepository
): Promise<FriendsListDTO> {
  const requests = await friendsRepository.listRequestsByUser(userId)
  const accepted = await friendsRepository.listAcceptedByUser(userId)

  const friends: FriendUserSummaryDTO[] = accepted.map((request) => {
    const other = request.senderId === userId ? request.receiver : request.sender
    return toUserSummary(other)
  })

  const incoming = requests
    .filter(request => request.status === 'pending' && request.receiverId === userId)
    .map(toRequestDTO)

  const outgoing = requests
    .filter(request => request.status === 'pending' && request.senderId === userId)
    .map(toRequestDTO)

  const blocked = requests
    .filter(request => request.status === 'blocked' && request.senderId === userId)
    .map(toRequestDTO)

  return {
    friends,
    incoming,
    outgoing,
    blocked
  }
}
