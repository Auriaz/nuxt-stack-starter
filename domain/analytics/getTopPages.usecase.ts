/**
 * Use-case: pobranie listy najpopularniejszych stron.
 */
import type { AnalyticsTopPageDTO } from '#shared/types'
import type { AnalyticsProvider, AnalyticsQuery } from './analytics.types'

import { ok, type Result } from '../shared/result'
import type { DomainError } from '../shared/errors'

export async function getTopPagesUseCase(
  query: AnalyticsQuery,
  provider: AnalyticsProvider
): Promise<Result<AnalyticsTopPageDTO[], DomainError>> {
  const data = await provider.getTopPages(query)
  return ok(data)
}
