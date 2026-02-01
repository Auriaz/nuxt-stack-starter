import type { PermissionKey } from '~~/shared/permissions'
import type { RoleDTO, UserDTO, PermissionDTO } from '~~/shared/types/auth'
import type { RoleWithPermissions } from '~~/server/repositories/role.repo'
import type { UserWithRolePermissions } from '~~/server/repositories/user.repo'
import type { Permission } from '../../prisma/generated/client.js'

export function toRoleDTO(role: RoleWithPermissions): RoleDTO {
  const permissions = role.permissions.map(rolePermission => rolePermission.permission.key as PermissionKey)
  return {
    id: role.id,
    name: role.name,
    description: role.description ?? null,
    permissions
  }
}

export function toUserDTO(user: UserWithRolePermissions): UserDTO {
  const roleName = user.roleRef?.name ?? user.role
  const permissions = user.roleRef?.permissions.map(rolePermission => rolePermission.permission.key as PermissionKey) ?? []
  const status = user.deactivatedAt ? ('blocked' as const) : ('active' as const)
  const deactivatedAt = user.deactivatedAt ? user.deactivatedAt.toISOString() : null

  return {
    id: user.id,
    email: user.email ?? null,
    name: user.name ?? null,
    username: user.username ?? null,
    avatarUrl: user.avatarUrl ?? null,
    role: roleName,
    permissions,
    roleId: user.roleId ?? null,
    status,
    deactivatedAt
  }
}

export function toPermissionDTO(permission: Permission): PermissionDTO {
  return {
    key: permission.key as PermissionKey,
    label: permission.label ?? null,
    group: permission.group ?? null
  }
}
