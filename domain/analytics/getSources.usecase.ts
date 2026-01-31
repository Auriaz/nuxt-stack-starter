/**
 * Use-case: pobranie źródeł ruchu (kanały).
 */
import type { AnalyticsSourceDTO } from '#shared/types'
import type { AnalyticsProvider, AnalyticsQuery } from './analytics.types'

import { ok, type Result } from '../shared/result'
import type { DomainError } from '../shared/errors'

export async function getSourcesUseCase(
  query: AnalyticsQuery,
  provider: AnalyticsProvider
): Promise<Result<AnalyticsSourceDTO[], DomainError>> {
  const data = await provider.getSources(query)
  return ok(data)
}
