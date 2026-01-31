import { object, string, pipe, regex, optional, picklist } from 'valibot'

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Format daty YYYY-MM-DD dla zakresu analityki.
 * Walidacja dateFrom <= dateTo i max 30 dni – w handlerze API.
 */
export const AnalyticsDateRangeSchema = object({
  dateFrom: pipe(
    string('dateFrom jest wymagane'),
    regex(ISO_DATE_REGEX, 'Nieprawidłowy format daty (wymagane YYYY-MM-DD)')
  ),
  dateTo: pipe(
    string('dateTo jest wymagane'),
    regex(ISO_DATE_REGEX, 'Nieprawidłowy format daty (wymagane YYYY-MM-DD)')
  )
})

/**
 * Schemat query dla endpointów analityki: dateFrom, dateTo, opcjonalnie period.
 */
export const AnalyticsQuerySchema = object({
  dateFrom: pipe(
    string('dateFrom jest wymagane'),
    regex(ISO_DATE_REGEX, 'Nieprawidłowy format dateFrom (YYYY-MM-DD)')
  ),
  dateTo: pipe(
    string('dateTo jest wymagane'),
    regex(ISO_DATE_REGEX, 'Nieprawidłowy format dateTo (YYYY-MM-DD)')
  ),
  period: optional(picklist(['7d', '30d']))
})
