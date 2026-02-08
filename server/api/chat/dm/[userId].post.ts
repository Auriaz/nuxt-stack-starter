import { safeParse } from 'valibot'
import { getRouterParam } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { ChatDmOpenInputSchema } from '#shared/schemas/chat'
import { getOrCreateDmThreadUseCase } from '~~/domain/chat/getOrCreateDmThread.usecase'
import { ChatAccessDeniedError } from '~~/domain/chat/errors'
import { chatRepository } from '~~/server/repositories/chat.repo'
import { friendsRepository } from '~~/server/repositories/friends.repo'

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
  if (!permissions.includes(PERMISSIONS.CHAT_USE) || !permissions.includes(PERMISSIONS.CHAT_DM_CREATE)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Chat DM access denied' } }
    })
  }

  const userIdParam = parseId(getRouterParam(event, 'userId'))
  const parsed = safeParse(ChatDmOpenInputSchema, { user_id: userIdParam })
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation error',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Invalid user id', issues: parsed.issues } }
    })
  }

  try {
    const thread = await getOrCreateDmThreadUseCase(userId, parsed.output.user_id, friendsRepository, chatRepository)
    return {
      data: {
        id: thread.id,
        type: thread.type,
        title: thread.title ?? undefined,
        team_id: thread.teamId ?? undefined,
        created_at: thread.createdAt.toISOString(),
        last_message_at: thread.lastMessageAt ? thread.lastMessageAt.toISOString() : undefined
      }
    }
  } catch (err) {
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
