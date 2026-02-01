/**
 * Resource do komunikacji z API ustawień.
 * Jedyny punkt, gdzie UI wykonuje fetch do /api/settings.
 */
import type { SettingsDTO, SettingsUpdateInput } from '#shared/types'
import { useApiClient } from './useApiClient'

export function useSettingsResource() {
  const apiClient = useApiClient()

  const getMySettings = async (): Promise<SettingsDTO> => {
    return await apiClient.request<SettingsDTO>('/api/settings/me')
  }

  const updateMySettings = async (payload: SettingsUpdateInput): Promise<SettingsDTO> => {
    return await apiClient.request<SettingsDTO>('/api/settings/me', {
      method: 'PATCH',
      body: payload
    })
  }

  return {
    getMySettings,
    updateMySettings
  }
}
