import { getQuery } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { userRepository } from '~~/server/repositories/user.repo'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id
  if (!userId) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } }
    })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.FRIENDS_INVITE)) {
    throw createError({
      status: 403,
      statusText: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }
    })
  }

  const query = getQuery(event)
  const q = typeof query.q === 'string' ? query.q.trim() : ''
  const limitRaw = typeof query.limit === 'string' ? Number(query.limit) : 20
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 20) : 20

  if (q.length < 2) {
    return { data: [] }
  }

  const results = await userRepository.searchPublicUsers(q, limit, userId)
  const data = results.map(item => ({
    id: item.id,
    username: item.username,
    email: item.email,
    name: item.name ?? undefined,
    avatar_url: item.avatarUrl ?? undefined
  }))

  return { data }
})
