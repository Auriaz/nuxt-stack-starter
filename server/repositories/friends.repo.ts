import { prisma } from '../services/prisma'

export interface FriendUserRecord {
  id: number
  username: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface FriendRequestRecord {
  id: number
  senderId: number
  receiverId: number
  status: string
  previousStatus: string | null
  message: string | null
  createdAt: Date
  updatedAt: Date
}

export interface FriendRequestWithUsersRecord extends FriendRequestRecord {
  sender: FriendUserRecord
  receiver: FriendUserRecord
}

export interface FriendsRepository {
  findRequestById(id: number): Promise<FriendRequestWithUsersRecord | null>
  findRequestBetweenUsers(userA: number, userB: number): Promise<FriendRequestWithUsersRecord | null>
  listRequestsBetweenUsers(userA: number, userB: number): Promise<FriendRequestWithUsersRecord[]>
  listRequestsByUser(userId: number): Promise<FriendRequestWithUsersRecord[]>
  listAcceptedByUser(userId: number): Promise<FriendRequestWithUsersRecord[]>
  createRequest(input: { senderId: number, receiverId: number, message?: string | null, status?: string }): Promise<FriendRequestWithUsersRecord>
  updateRequest(id: number, data: { senderId?: number, receiverId?: number, status?: string, previousStatus?: string | null, message?: string | null }): Promise<FriendRequestWithUsersRecord>
}

const selectUser = {
  id: true,
  username: true,
  email: true,
  name: true,
  avatarUrl: true
}

export const friendsRepository: FriendsRepository = {
  async findRequestById(id) {
    return await prisma.friendRequest.findUnique({
      where: { id },
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord | null
  },

  async findRequestBetweenUsers(userA, userB) {
    return await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord | null
  },

  async listRequestsBetweenUsers(userA, userB) {
    return await prisma.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userA, receiverId: userB },
          { senderId: userB, receiverId: userA }
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord[]
  },

  async listRequestsByUser(userId) {
    return await prisma.friendRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      orderBy: { updatedAt: 'desc' },
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord[]
  },

  async listAcceptedByUser(userId) {
    return await prisma.friendRequest.findMany({
      where: {
        status: 'accepted',
        OR: [{ senderId: userId }, { receiverId: userId }]
      },
      orderBy: { updatedAt: 'desc' },
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord[]
  },

  async createRequest(input) {
    return await prisma.friendRequest.create({
      data: {
        senderId: input.senderId,
        receiverId: input.receiverId,
        message: input.message ?? undefined,
        status: input.status ?? 'pending'
      },
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord
  },

  async updateRequest(id, data) {
    const updateData: Record<string, unknown> = {
      status: data.status,
      previousStatus: data.previousStatus ?? undefined,
      message: data.message ?? undefined
    }

    if (typeof data.senderId === 'number') {
      updateData.sender = { connect: { id: data.senderId } }
    }

    if (typeof data.receiverId === 'number') {
      updateData.receiver = { connect: { id: data.receiverId } }
    }

    return await prisma.friendRequest.update({
      where: { id },
      data: updateData,
      include: { sender: { select: selectUser }, receiver: { select: selectUser } }
    }) as FriendRequestWithUsersRecord
  }
}
