import type { ChatThreadDTO, ChatMessageDTO } from '#shared/types/chat'
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

  return {
    ensureAiThread,
    listThreads,
    listMessages
  }
}
