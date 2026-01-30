/**
 * Typy dla modułu Dashboard (widgety, filtry).
 */

/** Dane wykresu — lista punktów (label + value) lub obiekt z seriami */
export type ChartDataPoint = { label: string, value: number }
export type ChartData = ChartDataPoint[] | { labels: string[], series: { name: string, data: number[] }[] }

/** Wartości filtrów toolbar (klucz → wartość) */
export type DashboardFiltersValue = Record<string, string | number | undefined>
