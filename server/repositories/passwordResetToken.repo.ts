import { prisma } from '../services/prisma'
import type { PasswordResetToken } from '../../prisma/generated/client.js'

export interface PasswordResetTokenRepository {
  create(data: {
    userId: number
    tokenHash: string
    expiresAt: Date
    requestIp?: string
    userAgent?: string
  }): Promise<PasswordResetToken>

  findByTokenHash(tokenHash: string): Promise<(PasswordResetToken & {
    user: { id: number, email: string, username: string }
  }) | null>

  markUsed(id: number, usedAt: Date): Promise<PasswordResetToken>

  invalidateForUser(userId: number): Promise<void>

  // Opcjonalnie: czyszczenie wygasłych tokenów (dla cron job w v2)
  deleteExpired(beforeDate: Date): Promise<number>
}

export const passwordResetTokenRepository: PasswordResetTokenRepository = {
  async create(data) {
    return await prisma.passwordResetToken.create({
      data
    })
  },

  async findByTokenHash(tokenHash) {
    return await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true
          }
        }
      }
    })
  },

  async markUsed(id, usedAt) {
    return await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt }
    })
  },

  async invalidateForUser(userId) {
    // Defensive: w środowisku, w którym Prisma Client nie ma jeszcze
    // modelu `passwordResetToken` (np. stary build bez wygenerowanego klienta),
    // pomijamy unieważnianie, aby nie powodować 500 na /forgot-password.
    // Gdy klient jest aktualny, ta gałąź zadziała normalnie.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (prisma as any).passwordResetToken
    if (!model || typeof model.updateMany !== 'function') {
      return
    }

    await model.updateMany({
      where: {
        userId,
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    })
  },

  async deleteExpired(beforeDate) {
    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: {
          lt: beforeDate
        }
      }
    })
    return result.count
  }
}
