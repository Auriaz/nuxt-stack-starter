import { safeParse } from 'valibot'
import { getRouterParam } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { ChatTeamThreadCreateInputSchema } from '#shared/schemas/chat'
import { createTeamThreadUseCase } from '~~/domain/chat/createTeamThread.usecase'
import { ChatAccessDeniedError } from '~~/domain/chat/errors'
import { chatRepository } from '~~/server/repositories/chat.repo'
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

  const teamId = parseId(getRouterParam(event, 'teamId'))
  if (!teamId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid team id',
      data: { error: { code: 'BAD_REQUEST', message: 'Invalid team id' } }
    })
  }

  const body = await readBody(event)
  const parsed = safeParse(ChatTeamThreadCreateInputSchema, body ?? {})
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation error',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', issues: parsed.issues } }
    })
  }

  try {
    const thread = await createTeamThreadUseCase(userId, teamId, parsed.output, permissions, teamsRepository, chatRepository)
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
