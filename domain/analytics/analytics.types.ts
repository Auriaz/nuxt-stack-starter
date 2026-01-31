/**
 * Typy i porty dla analityki.
 * Domain nie zna Google SDK – tylko te interfejsy.
 */

import type {
  AnalyticsOverviewDTO,
  AnalyticsTimeSeriesDTO,
  AnalyticsTopPageDTO,
  AnalyticsSourceDTO
} from '#shared/types'

export interface AnalyticsQuery {
  dateFrom: string
  dateTo: string
  period?: '7d' | '30d'
}

/**
 * Port dostawcy danych analityki (GA4, Plausible, itd.).
 * Implementacja w server/services/analytics.
 */
export interface AnalyticsProvider {
  getOverview(query: AnalyticsQuery): Promise<AnalyticsOverviewDTO>
  getTopPages(query: AnalyticsQuery): Promise<AnalyticsTopPageDTO[]>
  getSources(query: AnalyticsQuery): Promise<AnalyticsSourceDTO[]>
  getTrend(query: AnalyticsQuery): Promise<AnalyticsTimeSeriesDTO>
}
