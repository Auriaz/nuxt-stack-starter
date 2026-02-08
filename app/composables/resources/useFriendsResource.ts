import type { FriendRequestSendInput, FriendsListDTO } from '#shared/types/friends'
import { useApiClient } from './useApiClient'

export function useFriendsResource() {
  const apiClient = useApiClient()

  const listFriends = async (): Promise<FriendsListDTO> => {
    return await apiClient.request<FriendsListDTO>('/api/friends')
  }

  const sendRequest = async (input: FriendRequestSendInput): Promise<{ request_id: number, status: string, auto_accepted?: boolean }> => {
    return await apiClient.request('/api/friends/requests', { method: 'POST', body: input })
  }

  const acceptRequest = async (requestId: number): Promise<{ request_id: number, status: string }> => {
    return await apiClient.request(`/api/friends/requests/${requestId}/accept`, { method: 'POST' })
  }

  const declineRequest = async (requestId: number): Promise<{ request_id: number, status: string }> => {
    return await apiClient.request(`/api/friends/requests/${requestId}/decline`, { method: 'POST' })
  }

  const cancelRequest = async (requestId: number): Promise<{ request_id: number, status: string }> => {
    return await apiClient.request(`/api/friends/requests/${requestId}/cancel`, { method: 'POST' })
  }

  const blockUser = async (userId: number): Promise<{ request_id: number, status: string }> => {
    return await apiClient.request(`/api/friends/${userId}/block`, { method: 'POST' })
  }

  const unblockUser = async (userId: number): Promise<{ request_id: number, status: string }> => {
    return await apiClient.request(`/api/friends/${userId}/unblock`, { method: 'POST' })
  }

  const removeFriend = async (userId: number): Promise<{ request_id: number, status: string }> => {
    return await apiClient.request(`/api/friends/${userId}`, { method: 'DELETE' })
  }

  return {
    listFriends,
    sendRequest,
    acceptRequest,
    declineRequest,
    cancelRequest,
    blockUser,
    unblockUser,
    removeFriend
  }
}
