import { prisma } from '../services/prisma'

export interface ChatThreadRecord {
  id: number
  type: string
  title: string | null
  createdById: number | null
  createdAt: Date
  updatedAt: Date
  lastMessageAt: Date | null
}

export interface ChatParticipantRecord {
  id: number
  threadId: number
  userId: number
  role: string
  joinedAt: Date
  leftAt: Date | null
  lastReadAt: Date | null
  mutedUntil: Date | null
}

export interface ChatMessageRecord {
  id: number
  threadId: number
  senderId: number | null
  type: string
  content: string
  metadata: unknown | null
  createdAt: Date
}

export interface ChatThreadTopicRecord {
  id: number
  threadId: number
  slug: string
  label: string
  order: number
  createdAt: Date
}

export interface ChatMessageSearchRecord {
  id: number
  threadId: number
  content: string
  createdAt: Date
  threadTitle: string | null
  threadType: string
}

export interface ChatRepository {
  findThreadById(threadId: number): Promise<ChatThreadRecord | null>
  findAiThreadByUserId(userId: number): Promise<ChatThreadRecord | null>
  findParticipant(threadId: number, userId: number): Promise<ChatParticipantRecord | null>
  listParticipantUserIds(threadId: number): Promise<number[]>
  listRecentMessages(threadId: number, limit?: number): Promise<ChatMessageRecord[]>
  listThreadsForUser(userId: number): Promise<ChatThreadRecord[]>
  listMessagesByThread(threadId: number, options?: { cursor?: Date, limit?: number }): Promise<ChatMessageRecord[]>
  listTopicsByThread(threadId: number): Promise<ChatThreadTopicRecord[]>
  searchMessagesForUser(userId: number, query: string, limit?: number): Promise<ChatMessageSearchRecord[]>
  createThread(input: { type: string, title?: string | null, createdById?: number | null }): Promise<ChatThreadRecord>
  createParticipant(input: { threadId: number, userId: number, role?: string }): Promise<ChatParticipantRecord>
  createTopics(threadId: number, topics: Array<{ slug: string, label: string, order: number }>): Promise<ChatThreadTopicRecord[]>
  createMessage(input: { threadId: number, senderId: number | null, type: string, content: string, metadata?: unknown | null }): Promise<ChatMessageRecord>
  updateThreadLastMessageAt(threadId: number, lastMessageAt: Date): Promise<void>
  updateParticipantLastReadAt(threadId: number, userId: number, lastReadAt: Date): Promise<void>
}

const getChatThreadModel = () => {
  const client = prisma as unknown as { chatThread: { findUnique: (args: unknown) => Promise<ChatThreadRecord | null>, update: (args: unknown) => Promise<ChatThreadRecord> } }
  return client.chatThread
}

const getChatParticipantModel = () => {
  const client = prisma as unknown as { chatParticipant: { findUnique: (args: unknown) => Promise<ChatParticipantRecord | null>, findMany: (args: unknown) => Promise<Array<{ userId: number }>>, update: (args: unknown) => Promise<ChatParticipantRecord> } }
  return client.chatParticipant
}

const getChatMessageModel = () => {
  const client = prisma as unknown as { chatMessage: { create: (args: unknown) => Promise<ChatMessageRecord>, findMany: (args: unknown) => Promise<ChatMessageRecord[]> } }
  return client.chatMessage
}

const getChatThreadTopicModel = () => {
  const client = prisma as unknown as { chatThreadTopic: { findMany: (args: unknown) => Promise<ChatThreadTopicRecord[]>, createMany: (args: unknown) => Promise<{ count: number }> } }
  return client.chatThreadTopic
}

export const chatRepository: ChatRepository = {
  async findThreadById(threadId) {
    const model = getChatThreadModel()
    return await model.findUnique({
      where: { id: threadId }
    })
  },

  async findAiThreadByUserId(userId) {
    const thread = await prisma.chatThread.findFirst({
      where: {
        type: 'ai',
        participants: {
          some: { userId }
        }
      }
    })
    return thread as ChatThreadRecord | null
  },

  async findParticipant(threadId, userId) {
    const model = getChatParticipantModel()
    return await model.findUnique({
      where: {
        threadId_userId: { threadId, userId }
      }
    })
  },

  async listParticipantUserIds(threadId) {
    const model = getChatParticipantModel()
    const participants = await model.findMany({
      where: { threadId },
      select: { userId: true }
    })
    return participants.map(item => item.userId)
  },

  async listRecentMessages(threadId, limit = 20) {
    const model = getChatMessageModel()
    const items = await model.findMany({
      where: { threadId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return items.reverse()
  },

  async listThreadsForUser(userId) {
    const items = await prisma.chatThread.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      orderBy: [
        { lastMessageAt: 'desc' },
        { updatedAt: 'desc' }
      ]
    })
    return items as ChatThreadRecord[]
  },

  async listMessagesByThread(threadId, options) {
    const limit = options?.limit ?? 50
    const cursor = options?.cursor
    const items = await prisma.chatMessage.findMany({
      where: {
        threadId,
        ...(cursor ? { createdAt: { lt: cursor } } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
    return items.reverse() as ChatMessageRecord[]
  },

  async listTopicsByThread(threadId) {
    const model = getChatThreadTopicModel()
    const items = await model.findMany({
      where: { threadId },
      orderBy: { order: 'asc' }
    })
    return items as ChatThreadTopicRecord[]
  },

  async searchMessagesForUser(userId, query, limit = 20) {
    const items = await prisma.chatMessage.findMany({
      where: {
        content: { contains: query, mode: 'insensitive' },
        thread: {
          participants: {
            some: { userId }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        threadId: true,
        content: true,
        createdAt: true,
        thread: {
          select: {
            title: true,
            type: true
          }
        }
      }
    })

    return items.map(item => ({
      id: item.id,
      threadId: item.threadId,
      content: item.content,
      createdAt: item.createdAt,
      threadTitle: item.thread?.title ?? null,
      threadType: item.thread?.type ?? 'dm'
    }))
  },

  async createThread(input) {
    const thread = await prisma.chatThread.create({
      data: {
        type: input.type as 'ai' | 'dm' | 'room',
        title: input.title ?? undefined,
        createdById: input.createdById ?? undefined
      }
    })
    return thread as ChatThreadRecord
  },

  async createParticipant(input) {
    const participant = await prisma.chatParticipant.create({
      data: {
        threadId: input.threadId,
        userId: input.userId,
        role: input.role ?? 'member'
      }
    })
    return participant as ChatParticipantRecord
  },

  async createTopics(threadId, topics) {
    if (topics.length === 0) return []
    const model = getChatThreadTopicModel()
    await model.createMany({
      data: topics.map(topic => ({
        threadId,
        slug: topic.slug,
        label: topic.label,
        order: topic.order
      })),
      skipDuplicates: true
    })
    return await model.findMany({
      where: { threadId },
      orderBy: { order: 'asc' }
    }) as ChatThreadTopicRecord[]
  },

  async createMessage(input) {
    const model = getChatMessageModel()
    return await model.create({
      data: {
        threadId: input.threadId,
        senderId: input.senderId,
        type: input.type,
        content: input.content,
        metadata: input.metadata ?? null
      }
    })
  },

  async updateThreadLastMessageAt(threadId, lastMessageAt) {
    const model = getChatThreadModel()
    await model.update({
      where: { id: threadId },
      data: { lastMessageAt }
    })
  },

  async updateParticipantLastReadAt(threadId, userId, lastReadAt) {
    const model = getChatParticipantModel()
    await model.update({
      where: { threadId_userId: { threadId, userId } },
      data: { lastReadAt }
    })
  }
}
