/**
 * Use-case: pobranie przeglądu analityki (użytkownicy, sesje, pageviews).
 */
import type { AnalyticsOverviewDTO } from '#shared/types'
import type { AnalyticsProvider, AnalyticsQuery } from './analytics.types'

import { ok, type Result } from '../shared/result'
import type { DomainError } from '../shared/errors'

export async function getOverviewUseCase(
  query: AnalyticsQuery,
  provider: AnalyticsProvider
): Promise<Result<AnalyticsOverviewDTO, DomainError>> {
  const data = await provider.getOverview(query)
  return ok(data)
}
