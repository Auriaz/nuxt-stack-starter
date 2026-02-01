import { getAdminOverviewUseCase } from '~~/domain/admin/getAdminOverview.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { roleRepository } from '~~/server/repositories/role.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)

  const data = await getAdminOverviewUseCase(userRepository, roleRepository)
  return { data }
})
