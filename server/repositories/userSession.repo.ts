/**
 * Repository dla sesji użytkownika (UserSession).
 * Używa raw SQL, żeby działać także gdy prisma generate nie zawiera jeszcze modeli UserSession/LoginEvent/ActivityLog.
 */
import { prisma } from '../services/prisma'

export interface UserSessionRecord {
  id: number
  userId: number
  sessionToken: string
  ipAddress: string | null
  userAgent: string | null
  location: string | null
  deviceType: string | null
  lastActivityAt: Date
  createdAt: Date
}

export interface UserSessionRepository {
  create(data: {
    userId: number
    sessionToken: string
    ipAddress?: string | null
    userAgent?: string | null
    location?: string | null
    deviceType?: string | null
  }): Promise<UserSessionRecord>
  findByUserId(userId: number): Promise<UserSessionRecord[]>
  findBySessionToken(sessionToken: string): Promise<UserSessionRecord | null>
  updateLastActivity(id: number): Promise<void>
  deleteById(id: number): Promise<void>
  deleteByUserIdExceptToken(userId: number, exceptSessionToken: string): Promise<number>
}

export const userSessionRepository: UserSessionRepository = {
  async create(data) {
    const [row] = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      sessionToken: string
      ipAddress: string | null
      userAgent: string | null
      location: string | null
      deviceType: string | null
      lastActivityAt: Date
      createdAt: Date
    }>>(
      `INSERT INTO "UserSession" ("userId", "sessionToken", "ipAddress", "userAgent", "location", "deviceType")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, "userId", "sessionToken", "ipAddress", "userAgent", "location", "deviceType", "lastActivityAt", "createdAt"`,
      data.userId,
      data.sessionToken,
      data.ipAddress ?? null,
      data.userAgent ?? null,
      data.location ?? null,
      data.deviceType ?? null
    )
    if (!row) throw new Error('UserSession create failed')
    return row
  },

  async findByUserId(userId) {
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      sessionToken: string
      ipAddress: string | null
      userAgent: string | null
      location: string | null
      deviceType: string | null
      lastActivityAt: Date
      createdAt: Date
    }>>(
      `SELECT id, "userId", "sessionToken", "ipAddress", "userAgent", "location", "deviceType", "lastActivityAt", "createdAt"
       FROM "UserSession" WHERE "userId" = $1 ORDER BY "lastActivityAt" DESC`,
      userId
    )
    return rows
  },

  async findBySessionToken(sessionToken) {
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: number
      userId: number
      sessionToken: string
      ipAddress: string | null
      userAgent: string | null
      location: string | null
      deviceType: string | null
      lastActivityAt: Date
      createdAt: Date
    }>>(
      `SELECT id, "userId", "sessionToken", "ipAddress", "userAgent", "location", "deviceType", "lastActivityAt", "createdAt"
       FROM "UserSession" WHERE "sessionToken" = $1 LIMIT 1`,
      sessionToken
    )
    return rows[0] ?? null
  },

  async updateLastActivity(id) {
    await prisma.$executeRawUnsafe(
      `UPDATE "UserSession" SET "lastActivityAt" = NOW() WHERE id = $1`,
      id
    )
  },

  async deleteById(id) {
    await prisma.$executeRawUnsafe(`DELETE FROM "UserSession" WHERE id = $1`, id)
  },

  async deleteByUserIdExceptToken(userId, exceptSessionToken) {
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM "UserSession" WHERE "userId" = $1 AND "sessionToken" != $2`,
      userId,
      exceptSessionToken
    )
    return typeof result === 'number' ? result : 0
  }
}
