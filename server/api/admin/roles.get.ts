import { listRolesUseCase } from '~~/domain/admin/manageRoles.usecase'
import { roleRepository } from '~~/server/repositories/role.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { toRoleDTO } from '~~/server/utils/adminDto'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.ROLES_READ)

  const roles = await listRolesUseCase(roleRepository)

  return {
    data: roles.map(role => toRoleDTO(role))
  }
})
