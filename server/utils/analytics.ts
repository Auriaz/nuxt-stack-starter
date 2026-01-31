/**
 * Walidacja zakresu dat dla analityki: dateFrom <= dateTo, max 30 dni, daty nie w przyszłość.
 */
const MAX_DAYS = 30

export function validateAnalyticsDateRange(dateFrom: string, dateTo: string): void {
  const from = new Date(dateFrom)
  const to = new Date(dateTo)
  const now = new Date()
  now.setHours(23, 59, 59, 999)

  if (Number.isNaN(from.getTime())) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nieprawidłowa data dateFrom',
          status: 422
        }
      }
    })
  }
  if (Number.isNaN(to.getTime())) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nieprawidłowa data dateTo',
          status: 422
        }
      }
    })
  }
  if (from > to) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'dateFrom nie może być późniejsza niż dateTo',
          status: 422
        }
      }
    })
  }
  if (from > now || to > now) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Daty nie mogą być w przyszłości',
          status: 422
        }
      }
    })
  }
  const diffTime = to.getTime() - from.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  if (diffDays > MAX_DAYS) {
    throw createError({
      status: 422,
      statusText: 'Validation Error',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: `Zakres dat nie może przekraczać ${MAX_DAYS} dni`,
          status: 422
        }
      }
    })
  }
}
