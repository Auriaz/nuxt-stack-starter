/**
 * GET /api/analytics/sources
 * Źródła ruchu (kanały).
 * Wymaga permission analytics.read. Query: dateFrom, dateTo, opcjonalnie period.
 */
import { getQuery } from 'h3'
import { safeParse } from 'valibot'
import { AnalyticsQuerySchema } from '#shared/schemas/analytics'
import { getSourcesUseCase } from '~~/domain/analytics/getSources.usecase'
import { createGa4Adapter } from '~~/server/services/analytics'
import { validateAnalyticsDateRange } from '~~/server/utils/analytics'
import { PERMISSIONS } from '~~/shared/permissions'
import { isErr } from '~~/domain/shared/result'

export default defineEventHandler(async (event) => {
  await requirePermission(event, PERMISSIONS.ANALYTICS_READ)

  const query = getQuery(event)
  const parsed = safeParse(AnalyticsQuerySchema, {
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
    period: query.period
  })
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query',
          status: 422,
          issues: parsed.issues
        }
      }
    })
  }

  validateAnalyticsDateRange(parsed.output.dateFrom, parsed.output.dateTo)

  const provider = createGa4Adapter()
  const result = await getSourcesUseCase(parsed.output, provider)
  if (isErr(result)) {
    throw createError({
      status: result.error.statusCode,
      statusText: result.error.message,
      data: {
        error: {
          code: result.error.code,
          message: result.error.message,
          status: result.error.statusCode
        }
      }
    })
  }

  return { data: result.value }
})
