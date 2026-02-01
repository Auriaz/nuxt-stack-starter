import { PERMISSIONS } from '~~/shared/permissions'
import type { RoleRepository } from '~~/server/repositories/role.repo'
import type { UserRepository, UserWithRolePermissions } from '~~/server/repositories/user.repo'

import { ForbiddenError, NotFoundError } from '../shared/errors'

export async function listUsersUseCase(userRepository: UserRepository) {
  return await userRepository.findAllWithRoles()
}

export interface ListUsersPaginatedResult {
  users: UserWithRolePermissions[]
  total: number
}

export async function listUsersPaginatedUseCase(
  page: number,
  limit: number,
  search: string | undefined,
  userRepository: UserRepository
): Promise<ListUsersPaginatedResult> {
  const offset = (page - 1) * limit
  const clampedLimit = Math.min(Math.max(1, limit), 100)
  return await userRepository.findAllPaginated(offset, clampedLimit, search || undefined)
}

/**
 * Przypisuje rolę użytkownikowi. Nie pozwala adminowi odebrać sobie roli z dostępem do panelu (admin.access).
 */
export async function assignUserRoleUseCase(
  userId: number,
  roleId: number,
  currentUserId: number,
  userRepository: UserRepository,
  roleRepository: RoleRepository
) {
  const role = await roleRepository.findByIdWithPermissions(roleId)
  if (!role) {
    throw new NotFoundError('Role not found')
  }

  const user = await userRepository.findById(userId)
  if (!user) {
    throw new NotFoundError('User not found')
  }

  if (userId === currentUserId) {
    const newRoleHasAdminAccess = role.permissions.some(
      rp => rp.permission.key === PERMISSIONS.ADMIN_ACCESS
    )
    if (!newRoleHasAdminAccess) {
      throw new ForbiddenError('Nie możesz odebrać sobie dostępu do panelu administracyjnego')
    }
  }

  return await userRepository.updateRoleId(userId, roleId, role.name)
}
