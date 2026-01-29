import { prisma } from '../services/prisma'
import type { Permission } from '../../prisma/generated/client.js'

export interface PermissionRepository {
  findAll(): Promise<Permission[]>
  findManyByKeys(keys: string[]): Promise<Permission[]>
}

export const permissionRepository: PermissionRepository = {
  async findAll() {
    return await prisma.permission.findMany({
      orderBy: { key: 'asc' }
    })
  },

  async findManyByKeys(keys) {
    if (!keys.length) {
      return []
    }
    return await prisma.permission.findMany({
      where: {
        key: { in: keys }
      }
    })
  }
}
