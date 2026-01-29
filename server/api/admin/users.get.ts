import { listUsersUseCase } from '~~/domain/admin/manageUsers.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { toUserDTO } from '~~/server/utils/adminDto'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.USERS_READ)

  const users = await listUsersUseCase(userRepository)

  return {
    data: users.map(user => toUserDTO(user))
  }
})
