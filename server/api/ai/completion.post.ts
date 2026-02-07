/**
 * POST /api/ai/completion — stream completion (asystent w edytorze).
 * Wymaga sesji. Klucz API z UserSettings.llmApiKey lub NUXT_AI_API_KEY.
 */
import { readBody } from 'h3'
import { safeParse } from 'valibot'
import { CompletionBodySchema } from '#shared/schemas/ai'
import { settingsRepository, parseLlmProviders } from '~~/server/repositories/settings.repo'
import { runCompletionStream } from '~~/server/utils/ai'
import type { CompletionMode } from '~~/server/utils/ai'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = (session.user as { id: number }).id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Session has no user id'
        }
      }
    })
  }

  const body = await readBody(event)
  const parsed = safeParse(CompletionBodySchema, body)
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          issues: parsed.issues
        }
      }
    })
  }

  const { prompt, mode, language, provider: requestedProvider } = parsed.output
  const settings = await settingsRepository.findByUserId(userId)
  const provider = (requestedProvider?.trim() || 'openai').toLowerCase()
  const entries = parseLlmProviders(settings?.llmProviders ?? null)
  const entry = entries.find(e => e.provider?.toLowerCase() === provider)
  let apiKey = entry?.apiKey?.trim()
  if (!apiKey && provider === 'openai') {
    apiKey = settings?.llmApiKey?.trim()
  }
  apiKey = apiKey || undefined

  const customSystemPrompt = (settings as { llmSystemPrompt?: string | null })?.llmSystemPrompt ?? null
  try {
    const result = await runCompletionStream(
      prompt,
      mode as CompletionMode,
      apiKey,
      language,
      customSystemPrompt
    )
    return result.toTextStreamResponse()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Completion failed'
    const isConfig = message.includes('Skonfiguruj klucz')
    const isQuota
      = /quota|billing|exceeded|rate limit/i.test(message)
        || message.includes('check your plan')
    const code = isConfig ? 'MISSING_API_KEY' : isQuota ? 'QUOTA_EXCEEDED' : 'COMPLETION_ERROR'
    throw createError({
      statusCode: isConfig ? 400 : isQuota ? 402 : 500,
      statusMessage: message,
      data: {
        error: {
          code,
          message
        }
      }
    })
  }
})
