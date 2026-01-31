/**
 * DTO i typy dla API analityki (GA4 / inne źródła).
 * UI dostaje tylko te struktury.
 */

export interface AnalyticsOverviewDTO {
  users: number
  sessions: number
  pageviews: number
}

export interface AnalyticsTimeSeriesPointDTO {
  date: string
  sessions: number
  pageviews: number
}

export interface AnalyticsTimeSeriesDTO {
  points: AnalyticsTimeSeriesPointDTO[]
}

export interface AnalyticsTopPageDTO {
  path: string
  title?: string
  pageviews: number
}

export interface AnalyticsSourceDTO {
  channel: string
  sessions: number
  users?: number
}
