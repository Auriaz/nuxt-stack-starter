import { permissionRepository } from '~~/server/repositories/permission.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { toPermissionDTO } from '~~/server/utils/adminDto'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.ROLES_READ)

  const permissions = await permissionRepository.findAll()

  return {
    data: permissions.map(permission => toPermissionDTO(permission))
  }
})
