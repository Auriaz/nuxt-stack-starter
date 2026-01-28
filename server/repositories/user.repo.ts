import { prisma } from '../services/prisma'
import type { User } from '../../prisma/generated/client.js'

/**
 * Repository dla operacji na użytkownikach
 *
 * Abstrakcja bazy danych dla auth use-case'ów.
 * Ułatwia testowanie i mockowanie.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  create(data: { email: string, username: string, password: string }): Promise<User>
  createFromOAuth(data: {
    email?: string
    name?: string
    username?: string
    avatarUrl?: string
    role?: string
  }): Promise<User>
  updatePassword(id: number, password: string): Promise<User>
  updateEmailVerifiedAt(id: number, emailVerifiedAt: Date): Promise<User>
  updatePasswordChangedAt(id: number, passwordChangedAt: Date): Promise<User>
}

export const userRepository: UserRepository = {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  },

  async findByUsername(username: string) {
    return await prisma.user.findUnique({
      where: { username }
    })
  },

  async create(data) {
    return await prisma.user.create({
      data
    })
  },

  async createFromOAuth(data) {
    return await prisma.user.create({
      data: {
        email: data.email ?? '',
        // Jeśli nie ma username z providera, można wygenerować lub zostawić pusty string
        username: data.username ?? (data.email ?? '').split('@')[0] ?? '',
        password: '', // OAuth users may not have local password
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
        role: data.role ?? 'user'
      }
    })
  },

  async updatePassword(id, password) {
    return await prisma.user.update({
      where: { id },
      data: { password }
    })
  },

  async updateEmailVerifiedAt(id, emailVerifiedAt) {
    return await prisma.user.update({
      where: { id },
      data: { emailVerifiedAt }
    })
  },

  async updatePasswordChangedAt(id, passwordChangedAt) {
    return await prisma.user.update({
      where: { id },
      data: { passwordChangedAt }
    })
  }
}
