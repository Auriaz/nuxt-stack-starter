/**
 * POST /api/chat/ai-thread - ensure per-user AI thread (one-time provisioning).
 */
import { PERMISSIONS } from '#shared/permissions'
import { chatRepository } from '~~/server/repositories/chat.repo'
import { userRepository } from '~~/server/repositories/user.repo'
import { settingsRepository, parseLlmProviders } from '~~/server/repositories/settings.repo'
import { ensureAiThreadForUser } from '~~/domain/chat/ensureAiThread.usecase'

function hasAiKey(settings: { llmProviders?: unknown, llmApiKey?: string | null } | null) {
  const entries = parseLlmProviders(settings?.llmProviders ?? null)
  const providerKey = entries.find(entry => entry.apiKey && entry.apiKey.trim().length > 0)
  const legacyKey = settings?.llmApiKey?.trim()
  return Boolean(providerKey || legacyKey)
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
  if (!permissions.includes(PERMISSIONS.CHAT_USE) || !permissions.includes(PERMISSIONS.CHAT_AI_USE)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'AI chat access denied' } }
    })
  }

  const settings = await settingsRepository.findByUserId(userId)
  if (!hasAiKey(settings)) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Missing AI key',
      data: { error: { code: 'MISSING_AI_KEY', message: 'Configure your AI provider key to enable AI chat.' } }
    })
  }

  const thread = await ensureAiThreadForUser(userId, chatRepository, userRepository)
  return { data: { threadId: thread.id } }
})
