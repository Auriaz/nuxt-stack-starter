import { prisma } from '../services/prisma'
import type { EmailVerificationToken } from '@prisma/client'

export interface EmailVerificationTokenRepository {
  create(data: {
    userId: number
    tokenHash: string
    expiresAt: Date
  }): Promise<EmailVerificationToken>

  findByTokenHash(tokenHash: string): Promise<EmailVerificationToken & { user: { id: number, email: string, username: string, emailVerifiedAt: Date | null } } | null>

  markUsed(id: number, usedAt: Date): Promise<EmailVerificationToken>

  invalidateForUser(userId: number): Promise<void>
}

export const emailVerificationTokenRepository: EmailVerificationTokenRepository = {
  async create(data) {
    return await prisma.emailVerificationToken.create({
      data
    })
  },

  async findByTokenHash(tokenHash) {
    return await prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            emailVerifiedAt: true
          }
        }
      }
    })
  },

  async markUsed(id, usedAt) {
    return await prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt }
    })
  },

  async invalidateForUser(userId) {
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId,
        usedAt: null
      },
      data: {
        usedAt: new Date()
      }
    })
  }
}
