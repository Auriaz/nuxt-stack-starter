/**
 * Resource do komunikacji z API powiadomień.
 * Jedyny punkt, gdzie UI wykonuje fetch do /api/notifications.
 */

import type { NotificationsListDTO } from '#shared/types'
import { useApiClient } from './useApiClient'

export function useNotificationsResource() {
  const apiClient = useApiClient()

  const fetchNotifications = async (): Promise<NotificationsListDTO> => {
    const data = await apiClient.request<NotificationsListDTO>('/api/notifications')
    return data
  }

  const markAsRead = async (id: number): Promise<{ updated: number }> => {
    return await apiClient.request<{ updated: number }>('/api/notifications/read', {
      method: 'PATCH',
      body: { ids: [id] }
    })
  }

  const markAllAsRead = async (): Promise<{ updated: number }> => {
    return await apiClient.request<{ updated: number }>('/api/notifications/read', {
      method: 'PATCH',
      body: { all: true }
    })
  }

  return {
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
}
