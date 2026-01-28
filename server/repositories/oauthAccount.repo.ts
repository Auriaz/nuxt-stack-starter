import { prisma } from '../services/prisma'
import type { OAuthAccount, User } from '../../prisma/generated/client.js'

export interface OAuthAccountWithUser extends OAuthAccount {
  user: User
}

export interface OAuthAccountRepository {
  findByProviderAccount(provider: string, providerAccountId: string): Promise<OAuthAccountWithUser | null>

  create(data: {
    userId: number
    provider: string
    providerAccountId: string
    accessToken?: string
    refreshToken?: string
    expiresAt?: Date
  }): Promise<OAuthAccount>
}

export const oauthAccountRepository: OAuthAccountRepository = {
  async findByProviderAccount(provider, providerAccountId) {
    return await prisma.oAuthAccount.findFirst({
      where: {
        provider,
        providerAccountId
      },
      include: {
        user: true
      }
    }) as OAuthAccountWithUser | null
  },

  async create(data) {
    return await prisma.oAuthAccount.create({
      data
    })
  }
}
