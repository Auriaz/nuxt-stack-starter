/**
 * GET /api/chat/threads/:id/messages - list messages for a thread.
 */
import { getRouterParam, getQuery } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { chatRepository } from '~~/server/repositories/chat.repo'

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

  const idParam = getRouterParam(event, 'id')
  const threadId = parseId(idParam)
  if (!threadId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid thread id',
      data: { error: { code: 'BAD_REQUEST', message: 'Invalid thread id' } }
    })
  }

  const thread = await chatRepository.findThreadById(threadId)
  if (!thread) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Thread not found',
      data: { error: { code: 'NOT_FOUND', message: 'Thread not found' } }
    })
  }

  const participant = await chatRepository.findParticipant(threadId, userId)
  if (!participant) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Not a participant' } }
    })
  }

  const query = getQuery(event)
  const cursorRaw = typeof query.cursor === 'string' ? query.cursor : undefined
  const cursorDate = cursorRaw ? new Date(cursorRaw) : undefined
  const cursor = cursorDate && !Number.isNaN(cursorDate.valueOf()) ? cursorDate : undefined

  const messages = await chatRepository.listMessagesByThread(threadId, { cursor })
  return {
    data: messages.map(message => ({
      id: message.id,
      thread_id: message.threadId,
      sender_id: message.senderId ?? undefined,
      type: message.type,
      content: message.content,
      metadata: message.metadata ?? undefined,
      created_at: message.createdAt.toISOString()
    }))
  }
})
