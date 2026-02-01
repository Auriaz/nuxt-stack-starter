import type { RoleRepository } from '~~/server/repositories/role.repo'
import type { UserRepository } from '~~/server/repositories/user.repo'

export interface AdminOverviewResult {
  usersCount: number
  rolesCount: number
}

export async function getAdminOverviewUseCase(
  userRepository: UserRepository,
  roleRepository: RoleRepository
): Promise<AdminOverviewResult> {
  const [usersCount, rolesCount] = await Promise.all([
    userRepository.count(),
    roleRepository.count()
  ])
  return { usersCount, rolesCount }
}
