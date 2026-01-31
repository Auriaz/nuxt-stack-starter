/**
 * Composable stanu i pobierania danych analityki.
 * Używa useAnalyticsResource; UI nie robi fetch bezpośrednio.
 */

import type {
  AnalyticsOverviewDTO,
  AnalyticsTimeSeriesDTO,
  AnalyticsTopPageDTO,
  AnalyticsSourceDTO
} from '#shared/types'
import { useAnalyticsResource, type AnalyticsQueryParams } from '~/composables/resources/useAnalyticsResource'

function getDefaultDateRange(): { dateFrom: string, dateTo: string } {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - 29)
  return {
    dateFrom: from.toISOString().slice(0, 10),
    dateTo: to.toISOString().slice(0, 10)
  }
}

export function useAnalytics() {
  const resource = useAnalyticsResource()
  const dateFrom = ref('')
  const dateTo = ref('')
  const period = ref<'7d' | '30d'>('30d')

  const overview = useState<AnalyticsOverviewDTO | null>('analytics-overview', () => null)
  const topPages = useState<AnalyticsTopPageDTO[] | null>('analytics-top-pages', () => null)
  const sources = useState<AnalyticsSourceDTO[] | null>('analytics-sources', () => null)
  const trend = useState<AnalyticsTimeSeriesDTO | null>('analytics-trend', () => null)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function setDateRange(from: string, to: string) {
    dateFrom.value = from
    dateTo.value = to
  }

  function initDateRange() {
    const { dateFrom: from, dateTo: to } = getDefaultDateRange()
    if (!dateFrom.value) dateFrom.value = from
    if (!dateTo.value) dateTo.value = to
  }

  function getParams(): AnalyticsQueryParams {
    initDateRange()
    return {
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      period: period.value
    }
  }

  async function fetchOverview(): Promise<AnalyticsOverviewDTO | null> {
    try {
      error.value = null
      const data = await resource.getOverview(getParams())
      overview.value = data
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Nie udało się pobrać przeglądu'
      return null
    }
  }

  async function fetchTopPages(): Promise<AnalyticsTopPageDTO[] | null> {
    try {
      error.value = null
      const data = await resource.getTopPages(getParams())
      topPages.value = data
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Nie udało się pobrać listy stron'
      return null
    }
  }

  async function fetchSources(): Promise<AnalyticsSourceDTO[] | null> {
    try {
      error.value = null
      const data = await resource.getSources(getParams())
      sources.value = data
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Nie udało się pobrać źródeł ruchu'
      return null
    }
  }

  async function fetchTrend(): Promise<AnalyticsTimeSeriesDTO | null> {
    try {
      error.value = null
      const data = await resource.getTrend(getParams())
      trend.value = data
      return data
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Nie udało się pobrać trendu'
      return null
    }
  }

  async function fetchAll(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const params = getParams()
      await Promise.all([
        resource.getOverview(params).then((d) => { overview.value = d }),
        resource.getTopPages(params).then((d) => { topPages.value = d }),
        resource.getSources(params).then((d) => { sources.value = d }),
        resource.getTrend(params).then((d) => { trend.value = d })
      ])
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Nie udało się pobrać danych analityki'
    } finally {
      isLoading.value = false
    }
  }

  return {
    overview: readonly(overview),
    topPages: readonly(topPages),
    sources: readonly(sources),
    trend: readonly(trend),
    dateFrom,
    dateTo,
    period,
    isLoading: readonly(isLoading),
    error: readonly(error),
    setDateRange,
    initDateRange,
    fetchOverview,
    fetchTopPages,
    fetchSources,
    fetchTrend,
    fetchAll
  }
}
