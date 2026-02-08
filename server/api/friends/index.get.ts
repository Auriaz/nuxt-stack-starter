import { PERMISSIONS } from '#shared/permissions'
import { listFriendsUseCase } from '~~/domain/friends/listFriends.usecase'
import { friendsRepository } from '~~/server/repositories/friends.repo'

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
  if (!permissions.includes(PERMISSIONS.FRIENDS_READ)) {
    throw createError({
      status: 403,
      statusText: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } }
    })
  }

  const data = await listFriendsUseCase(userId, friendsRepository)
  return { data }
})
