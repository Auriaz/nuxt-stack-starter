import { getRouterParam } from 'h3'
import { userRepository } from '~~/server/repositories/user.repo'
import { requirePermission } from '~~/server/utils/access'
import { toUserDTO } from '~~/server/utils/adminDto'
import { PERMISSIONS } from '~~/shared/permissions'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.USERS_READ)

  const idParam = getRouterParam(event, 'id')
  const id = parseId(idParam)
  if (id == null) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid user id' })
  }

  const user = await userRepository.findByIdWithRolePermissions(id)
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return { data: toUserDTO(user) }
})
