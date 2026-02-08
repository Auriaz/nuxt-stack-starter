/**
 * GET /api/chat/threads/:id/participants - list participants for a thread.
 */
import { getRouterParam } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { assertCanAccessThreadUseCase } from '~~/domain/chat/assertCanAccessThread.usecase'
import { ChatAccessDeniedError, ChatThreadNotFoundError } from '~~/domain/chat/errors'
import { chatRepository } from '~~/server/repositories/chat.repo'
import { friendsRepository } from '~~/server/repositories/friends.repo'
import { teamsRepository } from '~~/server/repositories/teams.repo'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] }
  const userId = user?.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } }
    })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.CHAT_USE)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Chat access denied' } }
    })
  }

  const threadId = parseId(getRouterParam(event, 'id'))
  if (!threadId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid thread id',
      data: { error: { code: 'BAD_REQUEST', message: 'Invalid thread id' } }
    })
  }

  try {
    await assertCanAccessThreadUseCase(
      { userId, threadId, permissions, action: 'read' },
      { chatRepository, friendsRepository, teamsRepository }
    )

    const participants = await chatRepository.listParticipantsWithUsers(threadId)
    return {
      data: participants.map(participant => ({
        user_id: participant.userId,
        role: participant.role,
        joined_at: participant.joinedAt.toISOString(),
        last_read_at: participant.lastReadAt ? participant.lastReadAt.toISOString() : undefined,
        user: participant.user
          ? {
              id: participant.user.id,
              username: participant.user.username,
              name: participant.user.name ?? undefined,
              email: participant.user.email ?? undefined,
              avatar_url: participant.user.avatarUrl ?? undefined
            }
          : undefined
      }))
    }
  } catch (err) {
    if (err instanceof ChatThreadNotFoundError) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Thread not found',
        data: { error: { code: 'NOT_FOUND', message: err.message } }
      })
    }
    if (err instanceof ChatAccessDeniedError) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden',
        data: { error: { code: 'FORBIDDEN', message: err.message } }
      })
    }
    throw err
  }
})
