/**
 * Resource do akcji na koncie użytkownika (eksport danych, deaktywacja, usunięcie).
 * Jedyny punkt wywołań API dla tych operacji.
 */

import { useApiClient } from './useApiClient'

export function useAccountActionsResource() {
  const apiClient = useApiClient()

  async function exportData(): Promise<Blob | Record<string, unknown>> {
    return await apiClient.request<Record<string, unknown>>('/api/profile/me/download')
  }

  async function deactivateAccount(password: string): Promise<{ ok?: boolean } | null> {
    return await apiClient.request<{ ok?: boolean }>('/api/profile/me/deactivate', {
      method: 'POST',
      body: { password }
    })
  }

  async function deleteAccount(password: string, confirmation: string): Promise<{ ok?: boolean } | null> {
    return await apiClient.request<{ ok?: boolean }>('/api/profile/me', {
      method: 'DELETE',
      body: { password, confirmation }
    })
  }

  return {
    exportData,
    deactivateAccount,
    deleteAccount
  }
}
