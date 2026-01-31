/**
 * Adapter Google Analytics Data API (GA4) – implementacja portu AnalyticsProvider.
 * Używany tylko na serwerze; credentials z runtimeConfig.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data'
import type {
  AnalyticsOverviewDTO,
  AnalyticsTimeSeriesDTO,
  AnalyticsTopPageDTO,
  AnalyticsSourceDTO
} from '#shared/types'
import type { AnalyticsProvider, AnalyticsQuery } from '~~/domain/analytics/analytics.types'

import {
  mapGaToOverviewDTO,
  mapGaToTimeSeriesDTO,
  mapGaToTopPagesDTO,
  mapGaToSourcesDTO
} from './ga4.mapper'

const GA_METRIC_ACTIVE_USERS = 'activeUsers'
const GA_METRIC_SESSIONS = 'sessions'
const GA_METRIC_SCREEN_PAGE_VIEWS = 'screenPageViews'
const GA_DIMENSION_DATE = 'date'
const GA_DIMENSION_PAGE_PATH = 'pagePath'
const GA_DIMENSION_PAGE_TITLE = 'pageTitle'
const GA_DIMENSION_CHANNEL = 'sessionDefaultChannelGroup'

function getClient() {
  const config = useRuntimeConfig()
  const { gaPropertyId, gaClientEmail, gaPrivateKey, enabled } = config.analytics as {
    gaPropertyId: string
    gaClientEmail: string
    gaPrivateKey: string
    enabled: boolean
  }
  if (!enabled || !gaPropertyId || !gaClientEmail || !gaPrivateKey) {
    return null
  }
  const privateKey = gaPrivateKey.replace(/\\n/g, '\n')
  return new BetaAnalyticsDataClient({
    credentials: {
      client_email: gaClientEmail,
      private_key: privateKey
    }
  })
}

function emptyOverview(): AnalyticsOverviewDTO {
  return { users: 0, sessions: 0, pageviews: 0 }
}

function emptyTimeSeries(): AnalyticsTimeSeriesDTO {
  return { points: [] }
}

export function createGa4Adapter(): AnalyticsProvider {
  return {
    async getOverview(query: AnalyticsQuery): Promise<AnalyticsOverviewDTO> {
      const client = getClient()
      if (!client) return emptyOverview()
      const propertyId = (useRuntimeConfig().analytics as { gaPropertyId: string }).gaPropertyId
      try {
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: query.dateFrom, endDate: query.dateTo }],
          metrics: [
            { name: GA_METRIC_ACTIVE_USERS },
            { name: GA_METRIC_SESSIONS },
            { name: GA_METRIC_SCREEN_PAGE_VIEWS }
          ]
        })
        const totals = response.totals?.[0]
        return mapGaToOverviewDTO(totals ? { metricValues: totals.metricValues } : null)
      } catch {
        return emptyOverview()
      }
    },

    async getTrend(query: AnalyticsQuery): Promise<AnalyticsTimeSeriesDTO> {
      const client = getClient()
      if (!client) return emptyTimeSeries()
      const propertyId = (useRuntimeConfig().analytics as { gaPropertyId: string }).gaPropertyId
      try {
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: query.dateFrom, endDate: query.dateTo }],
          dimensions: [{ name: GA_DIMENSION_DATE }],
          metrics: [
            { name: GA_METRIC_SESSIONS },
            { name: GA_METRIC_SCREEN_PAGE_VIEWS }
          ],
          orderBys: [{ dimension: { dimensionName: GA_DIMENSION_DATE } }]
        })
        const rows = response.rows ?? []
        return mapGaToTimeSeriesDTO(
          rows.map(r => ({
            dimensionValues: r.dimensionValues,
            metricValues: r.metricValues
          }))
        )
      } catch {
        return emptyTimeSeries()
      }
    },

    async getTopPages(query: AnalyticsQuery): Promise<AnalyticsTopPageDTO[]> {
      const client = getClient()
      if (!client) return []
      const propertyId = (useRuntimeConfig().analytics as { gaPropertyId: string }).gaPropertyId
      try {
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: query.dateFrom, endDate: query.dateTo }],
          dimensions: [
            { name: GA_DIMENSION_PAGE_PATH },
            { name: GA_DIMENSION_PAGE_TITLE }
          ],
          metrics: [{ name: GA_METRIC_SCREEN_PAGE_VIEWS }],
          orderBys: [{ metric: { metricName: GA_METRIC_SCREEN_PAGE_VIEWS }, desc: true }],
          limit: 20
        })
        const rows = response.rows ?? []
        return mapGaToTopPagesDTO(
          rows.map(r => ({
            dimensionValues: r.dimensionValues,
            metricValues: r.metricValues
          }))
        )
      } catch {
        return []
      }
    },

    async getSources(query: AnalyticsQuery): Promise<AnalyticsSourceDTO[]> {
      const client = getClient()
      if (!client) return []
      const propertyId = (useRuntimeConfig().analytics as { gaPropertyId: string }).gaPropertyId
      try {
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [{ startDate: query.dateFrom, endDate: query.dateTo }],
          dimensions: [{ name: GA_DIMENSION_CHANNEL }],
          metrics: [
            { name: GA_METRIC_SESSIONS },
            { name: GA_METRIC_ACTIVE_USERS }
          ],
          orderBys: [{ metric: { metricName: GA_METRIC_SESSIONS }, desc: true }],
          limit: 10
        })
        const rows = response.rows ?? []
        return mapGaToSourcesDTO(
          rows.map(r => ({
            dimensionValues: r.dimensionValues,
            metricValues: r.metricValues
          }))
        )
      } catch {
        return []
      }
    }
  }
}
