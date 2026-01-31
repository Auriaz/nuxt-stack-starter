/**
 * Use-case: pobranie trendu dziennego (wykres).
 */
import type { AnalyticsTimeSeriesDTO } from '#shared/types'
import type { AnalyticsProvider, AnalyticsQuery } from './analytics.types'

import { ok, type Result } from '../shared/result'
import type { DomainError } from '../shared/errors'

export async function getTrendUseCase(
  query: AnalyticsQuery,
  provider: AnalyticsProvider
): Promise<Result<AnalyticsTimeSeriesDTO, DomainError>> {
  const data = await provider.getTrend(query)
  return ok(data)
}
