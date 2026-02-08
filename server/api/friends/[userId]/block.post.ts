import { PERMISSIONS } from '#shared/permissions'
import { blockUserUseCase } from '~~/domain/friends/blockUser.usecase'
import { FriendSelfInviteError } from '~~/domain/friends/errors'
import { friendsRepository } from '~~/server/repositories/friends.repo'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id
  if (!userId) {
    throw createError({ status: 401, statusText: 'Unauthorized', data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } } })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.FRIENDS_MANAGE)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const targetId = parseId(getRouterParam(event, 'userId'))
  if (!targetId) {
    throw createError({ status: 400, statusText: 'Invalid id', data: { error: { code: 'BAD_REQUEST', message: 'Invalid user id' } } })
  }

  try {
    const request = await blockUserUseCase(userId, targetId, friendsRepository)
    return { data: { request_id: request.id, status: request.status } }
  } catch (err) {
    if (err instanceof FriendSelfInviteError) {
      throw createError({ status: 422, statusText: 'Invalid request', data: { error: { code: 'SELF_BLOCK', message: err.message } } })
    }
    throw err
  }
})
