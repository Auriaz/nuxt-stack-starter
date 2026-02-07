/**
 * GET /api/chat/threads - list chat threads for current user.
 */
import { PERMISSIONS } from '#shared/permissions'
import { chatRepository } from '~~/server/repositories/chat.repo'

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

  const threads = await chatRepository.listThreadsForUser(userId)
  const topicsByThread = await Promise.all(
    threads.map(async (thread) => {
      if (thread.type !== 'ai') return []
      return await chatRepository.listTopicsByThread(thread.id)
    })
  )

  return {
    data: threads.map((thread, index) => ({
      id: thread.id,
      type: thread.type,
      title: thread.title ?? undefined,
      created_at: thread.createdAt.toISOString(),
      last_message_at: thread.lastMessageAt ? thread.lastMessageAt.toISOString() : undefined,
      topics: topicsByThread[index]?.map(topic => ({
        id: topic.id,
        thread_id: topic.threadId,
        slug: topic.slug,
        label: topic.label,
        order: topic.order,
        created_at: topic.createdAt.toISOString()
      }))
    }))
  }
})
