import { prisma } from '../services/prisma'
import type { Prisma, User } from '../../prisma/generated/client.js'

export type UserWithRolePermissions = Prisma.UserGetPayload<{
  include: {
    roleRef: {
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    }
  }
}>

/**
 * Repository dla operacji na użytkownikach
 *
 * Abstrakcja bazy danych dla auth use-case'ów.
 * Ułatwia testowanie i mockowanie.
 */
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  findByUsername(username: string): Promise<User | null>
  findById(id: number): Promise<User | null>
  findByEmailWithRolePermissions(email: string): Promise<UserWithRolePermissions | null>
  findByIdWithRolePermissions(id: number): Promise<UserWithRolePermissions | null>
  findAllWithRoles(): Promise<UserWithRolePermissions[]>
  create(data: { email: string, username: string, password: string }): Promise<User>
  createFromOAuth(data: {
    email?: string
    name?: string
    username?: string
    avatarUrl?: string
    role?: string
    roleId?: number | null
  }): Promise<User>
  updateRoleId(id: number, roleId: number | null, roleName?: string): Promise<UserWithRolePermissions>
  updatePassword(id: number, password: string): Promise<User>
  updateEmailVerifiedAt(id: number, emailVerifiedAt: Date): Promise<User>
  updatePasswordChangedAt(id: number, passwordChangedAt: Date): Promise<User>
  updateProfile(id: number, data: { name?: string | null, avatarUrl?: string | null, bio?: string | null }): Promise<User>
  updatePrivacy(id: number, data: { showEmail?: boolean }): Promise<void>
  setDeactivatedAt(id: number, deactivatedAt: Date | null): Promise<User>
  delete(id: number): Promise<User>
  count(): Promise<number>
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

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id }
    })
  },

  async findByEmailWithRolePermissions(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })
  },

  async findByIdWithRolePermissions(id: number) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })
  },

  async findAllWithRoles() {
    return await prisma.user.findMany({
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    })
  },

  async findAllPaginated(offset, limit, search) {
    const where = search?.trim()
      ? {
          OR: [
            { email: { contains: search.trim(), mode: 'insensitive' as const } },
            { username: { contains: search.trim(), mode: 'insensitive' as const } }
          ]
        }
      : undefined
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          roleRef: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        },
        orderBy: { id: 'asc' },
        skip: offset,
        take: limit
      }),
      prisma.user.count({ where })
    ])
    return { users, total }
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
        role: data.role ?? 'user',
        roleId: data.roleId ?? undefined
      }
    })
  },

  async updateRoleId(id, roleId, roleName) {
    return await prisma.user.update({
      where: { id },
      data: {
        roleId,
        ...(roleName ? { role: roleName } : {})
      },
      include: {
        roleRef: {
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          }
        }
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
  },

  async updateProfile(id, data) {
    return await prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
        ...(data.bio !== undefined && { bio: data.bio })
      }
    })
  },

  async updatePrivacy(id, data) {
    if (data.showEmail === undefined) return
    await prisma.$executeRawUnsafe(
      'UPDATE "User" SET "showEmail" = $1 WHERE id = $2',
      data.showEmail,
      id
    )
  },

  async setDeactivatedAt(id, deactivatedAt) {
    return await prisma.user.update({
      where: { id },
      data: { deactivatedAt }
    })
  },

  async delete(id) {
    return await prisma.user.delete({
      where: { id }
    })
  },

  async count() {
    return await prisma.user.count()
  }
}
