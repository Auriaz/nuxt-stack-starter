import { safeParse } from 'valibot'
import { HealthOutputSchema } from '~~/shared/schemas/api'

/**
 * GET /api/health
 *
 * Health check endpoint
 * Zwraca status aplikacji, wersję i timestamp
 */
export default defineEventHandler(async () => {
  const output = {
    ok: true,
    version: '1.0.0', // W przyszłości można pobrać z package.json
    timestamp: new Date().toISOString()
  }

  // Walidacja outputu (opcjonalnie, dla spójności)
  const validationResult = safeParse(HealthOutputSchema, output)
  if (!validationResult.success) {
    throw createError({
      status: 500,
      statusText: 'Health check validation failed',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Output validation failed',
          issues: validationResult.issues
        }
      }
    })
  }

  return { data: validationResult.output }
})
