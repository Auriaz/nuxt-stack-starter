import { getQuery } from 'h3'
import { listUsersPaginatedUseCase } from '~~/domain/admin/manageUsers.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { requirePermission } from '~~/server/utils/access'
import { PERMISSIONS } from '~~/shared/permissions'
import { toUserDTO } from '~~/server/utils/adminDto'

function parsePage(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

function parseLimit(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.min(100, Math.max(1, n)) : 20
}

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ADMIN_ACCESS)
  await requirePermission(event, PERMISSIONS.USERS_READ)

  const query = getQuery(event)
  const page = parsePage(query.page)
  const limit = parseLimit(query.limit)
  const q = typeof query.q === 'string' ? query.q : undefined

  const { users, total } = await listUsersPaginatedUseCase(page, limit, q, userRepository)
  return {
    data: users.map(user => toUserDTO(user)),
    meta: { total, page, limit }
  }
})
