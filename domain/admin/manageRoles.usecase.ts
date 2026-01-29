import type { RoleRepository } from '~~/server/repositories/role.repo'
import type { PermissionRepository } from '~~/server/repositories/permission.repo'
import { NotFoundError, ValidationError } from '../shared/errors'

export async function listRolesUseCase(roleRepository: RoleRepository) {
  return await roleRepository.findAllWithPermissions()
}

export async function createRoleUseCase(
  input: { name: string, description?: string | null },
  roleRepository: RoleRepository
) {
  return await roleRepository.create({
    name: input.name,
    description: input.description ?? null
  })
}

export async function updateRoleUseCase(
  id: number,
  input: { name?: string, description?: string | null },
  roleRepository: RoleRepository
) {
  const existing = await roleRepository.findByIdWithPermissions(id)
  if (!existing) {
    throw new NotFoundError('Role not found')
  }

  await roleRepository.update(id, {
    name: input.name ?? existing.name,
    description: input.description ?? existing.description ?? null
  })

  const updated = await roleRepository.findByIdWithPermissions(id)
  if (!updated) {
    throw new NotFoundError('Role not found')
  }

  return updated
}

export async function assignRolePermissionsUseCase(
  roleId: number,
  permissionKeys: string[],
  roleRepository: RoleRepository,
  permissionRepository: PermissionRepository
) {
  const role = await roleRepository.findByIdWithPermissions(roleId)
  if (!role) {
    throw new NotFoundError('Role not found')
  }

  const permissions = await permissionRepository.findManyByKeys(permissionKeys)
  const foundKeys = new Set(permissions.map(permission => permission.key))
  const missingKeys = permissionKeys.filter(key => !foundKeys.has(key))

  if (missingKeys.length) {
    throw new ValidationError('Unknown permissions', missingKeys.map(key => ({
      path: 'permissionKeys',
      message: `Unknown permission: ${key}`
    })))
  }

  return await roleRepository.setPermissions(
    roleId,
    permissions.map(permission => permission.id)
  )
}
