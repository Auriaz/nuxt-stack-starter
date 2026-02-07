import type { ChatMessageDTO } from '#shared/types'
import type { ChatRepository, ChatMessageRecord, ChatThreadRecord } from '~~/server/repositories/chat.repo'
import { ChatAccessDeniedError, ChatThreadNotFoundError } from './errors'

export function toChatMessageDTO(record: ChatMessageRecord): ChatMessageDTO {
  return {
    id: record.id,
    thread_id: record.threadId,
    sender_id: record.senderId ?? undefined,
    type: record.type as ChatMessageDTO['type'],
    content: record.content,
    metadata: record.metadata ?? undefined,
    created_at: record.createdAt.toISOString()
  }
}

export async function createChatMessageUseCase(
  params: { threadId: number, senderId: number | null, type: 'user' | 'assistant' | 'system', content: string, metadata?: unknown | null },
  chatRepository: ChatRepository
): Promise<{ thread: ChatThreadRecord, message: ChatMessageDTO, createdAt: Date }> {
  const thread = await chatRepository.findThreadById(params.threadId)
  if (!thread) {
    throw new ChatThreadNotFoundError()
  }

  if (params.senderId) {
    const participant = await chatRepository.findParticipant(params.threadId, params.senderId)
    if (!participant) {
      throw new ChatAccessDeniedError('User is not a participant')
    }
  }

  const message = await chatRepository.createMessage({
    threadId: params.threadId,
    senderId: params.senderId,
    type: params.type,
    content: params.content,
    metadata: params.metadata
  })

  await chatRepository.updateThreadLastMessageAt(params.threadId, message.createdAt)

  return {
    thread,
    message: toChatMessageDTO(message),
    createdAt: message.createdAt
  }
}
