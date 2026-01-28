import type { ContactFormInput } from '#shared/types/api'
import { useApiClient } from './useApiClient'

/**
 * Resource composable dla formularza kontaktowego.
 *
 * Jedyny sposób, w jaki UI komunikuje się z /api/contact.
 */
export function useContactResource() {
  const apiClient = useApiClient()

  async function sendContact(input: ContactFormInput): Promise<{ ok: boolean }> {
    const response = await apiClient.request<{ ok: boolean } | { data: { ok: boolean } }>('/api/contact', {
      method: 'POST',
      body: input
    })

    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { ok: boolean } }).data
    }

    return response as { ok: boolean }
  }

  // (opcjonalnie) w przyszłości można dodać endpoint do listowania/sprawdzania wiadomości

  return {
    sendContact
  }
}
