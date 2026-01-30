/**
 * Repository dla logów aktywności (ActivityLog).
 * Używa raw SQL, żeby działać także gdy prisma generate nie zawiera jeszcze modeli.
 */
import { prisma } from '../services/prisma'

export interface ActivityLogRecord {
  id: number
  userId: number
  action: string
  description: string | null
  createdAt: Date
}

export interface ActivityLogRepository {
  create(data: { userId: number, action: string, description?: string | null }): Promise<ActivityLogRecord>
  findRecentByUserId(userId: number, limit?: number): Promise<ActivityLogRecord[]>
  countByUserId(userId: number): Promise<number>
}

export const activityLogRepository: ActivityLogRepository = {
  async create(data) {
    const [row] = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      action: string
      description: string | null
      createdAt: Date
    }>>(
      `INSERT INTO "ActivityLog" ("userId", "action", "description")
       VALUES ($1, $2, $3)
       RETURNING id, "userId", "action", "description", "createdAt"`,
      data.userId,
      data.action,
      data.description ?? null
    )
    if (!row) throw new Error('ActivityLog create failed')
    return row
  },

  async findRecentByUserId(userId, limit = 50) {
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      action: string
      description: string | null
      createdAt: Date
    }>>(
      `SELECT id, "userId", "action", "description", "createdAt"
       FROM "ActivityLog" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2`,
      userId,
      limit
    )
    return rows
  },

  async countByUserId(userId) {
    const result = await prisma.$queryRawUnsafe<Array<{ count: number | bigint }>>(
      `SELECT COUNT(*)::int as count FROM "ActivityLog" WHERE "userId" = $1`,
      userId
    )
    const count = result[0]?.count
    return typeof count === 'bigint' ? Number(count) : (Number(count) || 0)
  }
}
