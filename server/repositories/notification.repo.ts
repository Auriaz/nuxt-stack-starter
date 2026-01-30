import { prisma } from '../services/prisma'

/**
 * Kształt rekordu Notification z bazy (zgodny z Prisma po wygenerowaniu klienta).
 * Po uruchomieniu `prisma generate` można użyć typu z prisma/generated/client.js.
 */
export interface NotificationRecord {
  id: number
  userId: number
  type: string
  title: string
  message: string
  read: boolean
  actionUrl: string | null
  createdAt: Date
}

export interface NotificationRepository {
  findManyByUserId(userId: number, limit?: number): Promise<NotificationRecord[]>
  countUnreadByUserId(userId: number): Promise<number>
  markAsReadByIds(userId: number, ids: number[]): Promise<number>
  markAllAsReadByUserId(userId: number): Promise<number>
}

const getNotificationModel = () => {
  const client = prisma as unknown as { notification: { findMany: (args: unknown) => Promise<NotificationRecord[]>, count: (args: unknown) => Promise<number>, updateMany: (args: unknown) => Promise<{ count: number }> } }
  return client.notification
}

export const notificationRepository: NotificationRepository = {
  async findManyByUserId(userId, limit = 50) {
    const model = getNotificationModel()
    return await model.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  },

  async countUnreadByUserId(userId) {
    const model = getNotificationModel()
    return await model.count({
      where: { userId, read: false }
    })
  },

  async markAsReadByIds(userId, ids) {
    if (ids.length === 0) return 0
    const model = getNotificationModel()
    const result = await model.updateMany({
      where: { userId, id: { in: ids } },
      data: { read: true }
    })
    return result.count
  },

  async markAllAsReadByUserId(userId) {
    const model = getNotificationModel()
    const result = await model.updateMany({
      where: { userId },
      data: { read: true }
    })
    return result.count
  }
}
