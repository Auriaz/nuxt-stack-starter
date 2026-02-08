import { PERMISSIONS } from '#shared/permissions'
import { unblockUserUseCase } from '~~/domain/friends/unblockUser.usecase'
import { FriendAccessDeniedError, FriendRequestConflictError, FriendRequestNotFoundError } from '~~/domain/friends/errors'
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
    const result = await unblockUserUseCase(userId, targetId, friendsRepository)
    return { data: { request_id: result.request.id, status: result.request.status, changed: result.changed } }
  } catch (err) {
    if (err instanceof FriendRequestNotFoundError) {
      throw createError({ status: 404, statusText: 'Not found', data: { error: { code: 'NOT_FOUND', message: err.message } } })
    }
    if (err instanceof FriendAccessDeniedError) {
      throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: err.message } } })
    }
    if (err instanceof FriendRequestConflictError) {
      throw createError({ status: 409, statusText: 'Conflict', data: { error: { code: err.reason, message: err.message } } })
    }
    throw err
  }
})
