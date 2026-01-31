/**
 * Mapowanie odpowiedzi Google Analytics Data API na DTO aplikacji.
 * Funkcje czyste – bez zależności od Nitro.
 */

import type {
  AnalyticsOverviewDTO,
  AnalyticsTimeSeriesDTO,
  AnalyticsTimeSeriesPointDTO,
  AnalyticsTopPageDTO,
  AnalyticsSourceDTO
} from '#shared/types'

/** Surowa odpowiedź RunReport – uproszczony typ (metryki jako string w GA API). */
export interface GaRunReportRow {
  dimensionValues?: Array<{ value?: string }>
  metricValues?: Array<{ value?: string }>
}

export interface GaRunReportTotals {
  metricValues?: Array<{ value?: string }>
}

function parseMetric(row: GaRunReportRow | GaRunReportTotals, index: number): number {
  const values = row.metricValues
  if (!values || !values[index]) return 0
  const v = values[index].value
  return v ? parseInt(v, 10) || 0 : 0
}

export function mapGaToOverviewDTO(totals: GaRunReportTotals | null): AnalyticsOverviewDTO {
  if (!totals) {
    return { users: 0, sessions: 0, pageviews: 0 }
  }
  return {
    users: parseMetric(totals, 0),
    sessions: parseMetric(totals, 1),
    pageviews: parseMetric(totals, 2)
  }
}

export function mapGaToTimeSeriesDTO(rows: GaRunReportRow[]): AnalyticsTimeSeriesDTO {
  const points: AnalyticsTimeSeriesPointDTO[] = rows.map((row) => {
    const dateVal = row.dimensionValues?.[0]?.value ?? ''
    return {
      date: dateVal,
      sessions: parseMetric(row, 0),
      pageviews: parseMetric(row, 1)
    }
  })
  return { points }
}

export function mapGaToTopPagesDTO(rows: GaRunReportRow[]): AnalyticsTopPageDTO[] {
  return rows.map(row => ({
    path: row.dimensionValues?.[0]?.value ?? '',
    title: row.dimensionValues?.[1]?.value,
    pageviews: parseMetric(row, 0)
  }))
}

export function mapGaToSourcesDTO(rows: GaRunReportRow[]): AnalyticsSourceDTO[] {
  return rows.map(row => ({
    channel: row.dimensionValues?.[0]?.value ?? '',
    sessions: parseMetric(row, 0),
    users: parseMetric(row, 1)
  }))
}
