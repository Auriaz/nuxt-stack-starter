import { prisma } from '../services/prisma'
import type { Prisma, Role } from '@prisma/client'

export type RoleWithPermissions = Prisma.RoleGetPayload<{
  include: {
    permissions: {
      include: {
        permission: true
      }
    }
  }
}>

export interface RoleRepository {
  findAllWithPermissions(): Promise<RoleWithPermissions[]>
  findByIdWithPermissions(id: number): Promise<RoleWithPermissions | null>
  findByNameWithPermissions(name: string): Promise<RoleWithPermissions | null>
  create(data: { name: string, description?: string | null }): Promise<Role>
  update(id: number, data: { name?: string, description?: string | null }): Promise<Role>
  setPermissions(roleId: number, permissionIds: number[]): Promise<RoleWithPermissions>
  count(): Promise<number>
}

export const roleRepository: RoleRepository = {
  async findAllWithPermissions() {
    return await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  },

  async findByIdWithPermissions(id) {
    return await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  },

  async findByNameWithPermissions(name) {
    return await prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })
  },

  async create(data) {
    return await prisma.role.create({
      data
    })
  },

  async update(id, data) {
    return await prisma.role.update({
      where: { id },
      data
    })
  },

  async setPermissions(roleId, permissionIds) {
    const operations = [prisma.rolePermission.deleteMany({ where: { roleId } })]
    if (permissionIds.length) {
      operations.push(
        prisma.rolePermission.createMany({
          data: permissionIds.map(permissionId => ({ roleId, permissionId })),
          skipDuplicates: true
        })
      )
    }

    await prisma.$transaction(operations)

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    })

    if (!role) {
      throw new Error('Role not found after update')
    }

    return role
  },

  async count() {
    return await prisma.role.count()
  }
}
