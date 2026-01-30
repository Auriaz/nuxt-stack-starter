/**
 * Repository dla ostatnich logowań (LoginEvent).
 * Używa raw SQL, żeby działać także gdy prisma generate nie zawiera jeszcze modeli.
 */
import { prisma } from '../services/prisma'

export interface LoginEventRecord {
  id: number
  userId: number
  ipAddress: string | null
  location: string | null
  createdAt: Date
}

export interface LoginEventRepository {
  create(data: { userId: number, ipAddress?: string | null, location?: string | null }): Promise<LoginEventRecord>
  findRecentByUserId(userId: number, limit?: number): Promise<LoginEventRecord[]>
}

export const loginEventRepository: LoginEventRepository = {
  async create(data) {
    const [row] = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      ipAddress: string | null
      location: string | null
      createdAt: Date
    }>>(
      `INSERT INTO "LoginEvent" ("userId", "ipAddress", "location")
       VALUES ($1, $2, $3)
       RETURNING id, "userId", "ipAddress", "location", "createdAt"`,
      data.userId,
      data.ipAddress ?? null,
      data.location ?? null
    )
    if (!row) throw new Error('LoginEvent create failed')
    return row
  },

  async findRecentByUserId(userId, limit = 20) {
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      ipAddress: string | null
      location: string | null
      createdAt: Date
    }>>(
      `SELECT id, "userId", "ipAddress", "location", "createdAt"
       FROM "LoginEvent" WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT $2`,
      userId,
      limit
    )
    return rows
  }
}
