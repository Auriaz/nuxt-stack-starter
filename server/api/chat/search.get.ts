import { createError, defineEventHandler, getQuery } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { chatRepository } from '~~/server/repositories/chat.repo'

type SearchItem = {
  message_id: number
  thread_id: number
  thread_title: string | null
  thread_type: string
  snippet: string
  created_at: string
}

function buildSnippet(content: string, query: string, maxLen = 180) {
  const normalized = content.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLen) return normalized

  const lower = normalized.toLowerCase()
  const q = query.toLowerCase()
  const index = lower.indexOf(q)
  if (index === -1) {
    return `${normalized.slice(0, maxLen - 1)}…`
  }

  const start = Math.max(0, index - 60)
  const end = Math.min(normalized.length, index + q.length + 80)
  const prefix = start > 0 ? '…' : ''
  const suffix = end < normalized.length ? '…' : ''
  return `${prefix}${normalized.slice(start, end)}${suffix}`
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.CHAT_USE)) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const query = getQuery(event)
  const raw = typeof query.q === 'string' ? query.q : ''
  const term = raw.trim()
  if (term.length < 2) {
    return { items: [] as SearchItem[] }
  }

  const limitRaw = typeof query.limit === 'string' ? Number(query.limit) : 20
  const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 20

  const results = await chatRepository.searchMessagesForUser(userId, term, limit)
  const items: SearchItem[] = results.map(item => ({
    message_id: item.id,
    thread_id: item.threadId,
    thread_title: item.threadTitle,
    thread_type: item.threadType,
    snippet: buildSnippet(item.content, term),
    created_at: item.createdAt.toISOString()
  }))

  return { items }
})
