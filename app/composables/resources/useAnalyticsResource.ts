/**
 * Resource do API analityki – jedyny punkt wywołań API dla dashboard/analytics.
 */

import type {
  AnalyticsOverviewDTO,
  AnalyticsTimeSeriesDTO,
  AnalyticsTopPageDTO,
  AnalyticsSourceDTO
} from '#shared/types'
import { useApiClient } from './useApiClient'

export interface AnalyticsQueryParams {
  dateFrom: string
  dateTo: string
  period?: '7d' | '30d'
}

function buildQuery(params: AnalyticsQueryParams): string {
  const search = new URLSearchParams()
  search.set('dateFrom', params.dateFrom)
  search.set('dateTo', params.dateTo)
  if (params.period) {
    search.set('period', params.period)
  }
  return search.toString()
}

export function useAnalyticsResource() {
  const apiClient = useApiClient()

  async function getOverview(params: AnalyticsQueryParams): Promise<AnalyticsOverviewDTO> {
    const q = buildQuery(params)
    return await apiClient.request<AnalyticsOverviewDTO>(`/api/analytics/overview?${q}`)
  }

  async function getTopPages(params: AnalyticsQueryParams): Promise<AnalyticsTopPageDTO[]> {
    const q = buildQuery(params)
    return await apiClient.request<AnalyticsTopPageDTO[]>(`/api/analytics/pages?${q}`)
  }

  async function getSources(params: AnalyticsQueryParams): Promise<AnalyticsSourceDTO[]> {
    const q = buildQuery(params)
    return await apiClient.request<AnalyticsSourceDTO[]>(`/api/analytics/sources?${q}`)
  }

  async function getTrend(params: AnalyticsQueryParams): Promise<AnalyticsTimeSeriesDTO> {
    const q = buildQuery(params)
    return await apiClient.request<AnalyticsTimeSeriesDTO>(`/api/analytics/trend?${q}`)
  }

  return {
    getOverview,
    getTopPages,
    getSources,
    getTrend
  }
}
