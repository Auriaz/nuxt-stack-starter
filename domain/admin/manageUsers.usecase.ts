import type { RoleRepository } from '~~/server/repositories/role.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { NotFoundError } from '../shared/errors'

export async function listUsersUseCase(userRepository: UserRepository) {
  return await userRepository.findAllWithRoles()
}

export async function assignUserRoleUseCase(
  userId: number,
  roleId: number,
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

  return await userRepository.updateRoleId(userId, roleId, role.name)
}
