import type { ChatThreadDTO, ChatMessageDTO, ChatParticipantWithUserDTO } from '#shared/types/chat'
import { useApiClient } from './useApiClient'

export function useChatResource() {
  const apiClient = useApiClient()

  const ensureAiThread = async (): Promise<{ threadId: number }> => {
    return await apiClient.request<{ threadId: number }>('/api/chat/ai-thread', { method: 'POST' })
  }

  const listThreads = async (): Promise<ChatThreadDTO[]> => {
    return await apiClient.request<ChatThreadDTO[]>('/api/chat/threads')
  }

  const listMessages = async (threadId: number, cursor?: string): Promise<ChatMessageDTO[]> => {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    return await apiClient.request<ChatMessageDTO[]>(`/api/chat/threads/${threadId}/messages${query}`)
  }

  const listParticipants = async (threadId: number): Promise<ChatParticipantWithUserDTO[]> => {
    return await apiClient.request<ChatParticipantWithUserDTO[]>(`/api/chat/threads/${threadId}/participants`)
  }

  const openDm = async (userId: number): Promise<ChatThreadDTO> => {
    return await apiClient.request<ChatThreadDTO>(`/api/chat/dm/${userId}`, { method: 'POST' })
  }

  const listTeamThreads = async (teamId: number): Promise<ChatThreadDTO[]> => {
    return await apiClient.request<ChatThreadDTO[]>(`/api/chat/teams/${teamId}/threads`)
  }

  const createTeamThread = async (teamId: number, title?: string): Promise<ChatThreadDTO> => {
    return await apiClient.request<ChatThreadDTO>(`/api/chat/teams/${teamId}/threads`, {
      method: 'POST',
      body: { title }
    })
  }

  return {
    ensureAiThread,
    listThreads,
    listMessages,
    listParticipants,
    openDm,
    listTeamThreads,
    createTeamThread
  }
}
