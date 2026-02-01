/**
 * Composable do komunikacji z API backendu
 *
 * Jedyny punkt, gdzie frontend wykonuje fetch do backendu.
 * Zapewnia spójną obsługę błędów i format odpowiedzi.
 *
 * @example
 * ```ts
 * const apiClient = useApiClient()
 * const users = await apiClient.request<User[]>('/api/users')
 * ```
 */
export function useApiClient() {
  interface ApiError {
    code: string
    message: string
    issues?: unknown[]
  }

  interface ApiResponse<T> {
    data?: T
    error?: ApiError
  }

  async function request<T>(
    url: string,
    options?: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
      body?: BodyInit | Record<string, unknown> | null
      headers?: Record<string, string>
      /** Gdy false, zwraca cały obiekt odpowiedzi (np. { data, meta }) zamiast tylko response.data */
      unwrap?: boolean
    }
  ): Promise<T> {
    try {
      const unwrap = options?.unwrap !== false
      const response = await $fetch<ApiResponse<T> | T>(url, {
        method: options?.method || 'GET',
        body: options?.body,
        headers: options?.headers
      })

      // Obsługa formatu { data: ... } lub bezpośredniego zwrotu
      if (response && typeof response === 'object' && 'data' in response) {
        const apiResponse = response as ApiResponse<T>
        if (apiResponse.error) {
          // Rzuć H3Error z data.error dla lepszej integracji z useForm.setErrorsFromApi
          throw createError({
            status: 422, // Domyślnie 422 dla błędów walidacji
            statusText: apiResponse.error.message || 'Request failed',
            data: {
              error: apiResponse.error
            }
          })
        }
        if (unwrap && apiResponse.data !== undefined) {
          return apiResponse.data
        }
        if (!unwrap) {
          return response as T
        }
      }

      // Bezpośredni zwrot (dla kompatybilności wstecznej)
      return response as T
    } catch (error: unknown) {
      // Type guard dla H3Error z data.error
      if (
        error
        && typeof error === 'object'
        && 'data' in error
        && error.data
        && typeof error.data === 'object'
        && 'error' in error.data
      ) {
        // Błąd już ma poprawną strukturę - przekaż go dalej
        throw error
      }

      // Type guard dla błędów z statusCode/status
      if (
        error
        && typeof error === 'object'
        && ('statusCode' in error || 'status' in error)
      ) {
        const status = 'statusCode' in error ? (error.statusCode as number) : ('status' in error ? (error.status as number) : 500)
        const statusCode = 'statusCode' in error ? (error.statusCode as number) : status

        // Sprawdź, czy błąd już ma data.error (z endpointu)
        const errorData = (error as { data?: { error?: ApiError } }).data
        if (errorData?.error) {
          // Błąd już ma poprawną strukturę data.error - przekaż go dalej
          throw createError({
            status,
            statusText: errorData.error.message || 'Request failed',
            data: {
              error: errorData.error
            }
          })
        }

        // Jeśli nie ma data.error, stwórz nowy błąd
        const statusMessage
          = ('statusMessage' in error ? (error.statusMessage as string) : null)
            || ('statusText' in error ? (error.statusText as string) : null)
            || ('message' in error && typeof error.message === 'string' ? error.message : null)
            || 'Request failed'

        throw createError({
          status,
          statusText: statusMessage,
          data: {
            error: {
              code:
                statusCode === 401
                  ? 'UNAUTHORIZED'
                  : statusCode === 403
                    ? 'FORBIDDEN'
                    : statusCode === 404
                      ? 'NOT_FOUND'
                      : 'INTERNAL_ERROR',
              message: statusMessage
            }
          }
        })
      }

      // Dla innych błędów (Error lub unknown), stwórz H3Error z data.error
      const errorMessage
        = error instanceof Error ? error.message : typeof error === 'string' ? error : 'Request failed'

      throw createError({
        status: 500,
        statusText: errorMessage,
        data: {
          error: {
            code: 'INTERNAL_ERROR',
            message: errorMessage
          }
        }
      })
    }
  }

  return { request }
}
