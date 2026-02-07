import { safeParse } from 'valibot'
import type { H3Event } from 'h3'
import type { ModelMessage } from 'ai'
import { randomUUID } from 'node:crypto'
import { PERMISSIONS } from '#shared/permissions'
import {
  ChatSocketEnvelopeSchema,
  ChatMessageSendInputSchema,
  ChatThreadJoinInputSchema,
  ChatThreadLeaveInputSchema,
  ChatReadUpdateInputSchema,
  ChatTypingInputSchema
} from '#shared/schemas/chat'
import type {
  ChatMessageNewPayload,
  ChatMessageDeltaPayload,
  ChatReadUpdatedPayload,
  ChatErrorPayload
} from '#shared/types/chat'
import { chatRepository } from '~~/server/repositories/chat.repo'
import { settingsRepository, parseLlmProviders } from '~~/server/repositories/settings.repo'
import { createChatMessageUseCase } from '~~/domain/chat/createMessage.usecase'
import { markThreadReadUseCase } from '~~/domain/chat/markThreadRead.usecase'
import { ChatAccessDeniedError, ChatThreadNotFoundError } from '~~/domain/chat/errors'
import { createChatCompletionStream } from '~~/server/utils/chat-ai'

const ROOM_USER_PREFIX = 'user:'
const ROOM_THREAD_PREFIX = 'thread:'

function toJson(data: unknown) {
  return JSON.stringify(data)
}

function getPeerContext(eventLike: { context?: Record<string, unknown> } | undefined) {
  return (eventLike?.context ?? {}) as Record<string, unknown>
}

function extractEvent(request: { context?: Record<string, unknown>, event?: H3Event } | H3Event | undefined) {
  if (!request) return undefined

  const directEvent = (request as { event?: H3Event }).event
  if (directEvent?.node?.req) {
    return directEvent
  }

  const maybeEvent = request as H3Event
  if (maybeEvent?.node?.req) {
    return maybeEvent
  }

  const ctx = getPeerContext(request)
  return (ctx.event as H3Event | undefined) ?? undefined
}

function sendError(peer: { send: (data: unknown) => void }, payload: ChatErrorPayload) {
  peer.send(toJson({ type: 'chat.error', payload }))
}

function getPeerUserId(peer: { context?: Record<string, unknown> }) {
  const raw = peer.context?.userId
  const userId = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(userId) && userId > 0 ? userId : null
}

function publishToUsers(peer: { publish: (topic: string, data: unknown) => void, context?: Record<string, unknown>, send?: (data: unknown) => void }, userIds: number[], payload: unknown) {
  const message = toJson(payload)
  const currentUserId = getPeerUserId(peer)
  if (currentUserId && userIds.includes(currentUserId) && 'send' in peer) {
    ; (peer as { send: (data: unknown) => void }).send(message)
  }
  for (const userId of userIds) {
    peer.publish(`${ROOM_USER_PREFIX}${userId}`, message)
  }
}

function toHeaders(input: Record<string, string | string[] | undefined> | undefined) {
  const headers = new Headers()
  if (!input) return headers
  for (const [key, value] of Object.entries(input)) {
    if (!value) continue
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '))
    } else {
      headers.set(key, value)
    }
  }
  return headers
}

export default defineWebSocketHandler({
  async upgrade(request) {
    const event = extractEvent(request)
    if (!event) {
      if (request && typeof request === 'object') {
        Object.keys((request as { context?: Record<string, unknown> }).context || {})
      }
    }

    const nodeHeaders = (request as { _req?: { headers?: Record<string, string | string[] | undefined> } })?._req?.headers
    const fallbackHeaders = (request as { _headers?: Record<string, string> })?._headers
    let session: { user?: { id?: number, permissions?: string[] } } | null = null
    try {
      session = event
        ? await getUserSession(event)
        : await getUserSession({
            request: { headers: toHeaders(nodeHeaders || fallbackHeaders) },
            context: (request as { context?: Record<string, unknown> })?.context || {}
          })
    } catch (err) {
      if (err instanceof Error) {
        session = null
      }
    }
    const user = session?.user as { id?: number, permissions?: string[] } | undefined
    const userId = user?.id

    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const permissions = user.permissions ?? []
    if (!permissions.includes(PERMISSIONS.CHAT_USE)) {
      return new Response('Forbidden', { status: 403 })
    }

    const ctx = (request as { context?: Record<string, unknown> }).context
    if (ctx) {
      ctx.userId = userId
      ctx.permissions = permissions
    }
  },

  open(peer) {
    const userId = Number(peer.context.userId)
    if (!userId) {
      peer.close(1008, 'Unauthorized')
      return
    }

    peer.subscribe(`${ROOM_USER_PREFIX}${userId}`)
  },

  async message(peer, message) {
    let raw
    try {
      raw = JSON.parse(message.text())
    } catch {
      sendError(peer, { code: 'INVALID_JSON', message: 'Invalid JSON payload' })
      return
    }

    const envelopeResult = safeParse(ChatSocketEnvelopeSchema, raw)
    if (!envelopeResult.success) {
      sendError(peer, { code: 'INVALID_ENVELOPE', message: 'Invalid envelope' })
      return
    }

    const { type, payload } = envelopeResult.output
    const userId = Number(peer.context.userId)
    const permissions = Array.isArray(peer.context.permissions) ? peer.context.permissions as string[] : []

    if (!userId) {
      sendError(peer, { code: 'UNAUTHORIZED', message: 'Missing session' })
      return
    }

    if (type === 'chat.thread.join') {
      const parsed = safeParse(ChatThreadJoinInputSchema, payload ?? {})
      if (!parsed.success) {
        sendError(peer, { code: 'VALIDATION_ERROR', message: 'Invalid join payload' })
        return
      }

      const participant = await chatRepository.findParticipant(parsed.output.thread_id, userId)
      if (!participant) {
        sendError(peer, { code: 'FORBIDDEN', message: 'Not a participant' })
        return
      }

      peer.subscribe(`${ROOM_THREAD_PREFIX}${parsed.output.thread_id}`)
      peer.send(toJson({ type: 'chat.thread.joined', payload: { thread_id: parsed.output.thread_id } }))
      return
    }

    if (type === 'chat.thread.leave') {
      const parsed = safeParse(ChatThreadLeaveInputSchema, payload ?? {})
      if (!parsed.success) {
        sendError(peer, { code: 'VALIDATION_ERROR', message: 'Invalid leave payload' })
        return
      }

      peer.unsubscribe(`${ROOM_THREAD_PREFIX}${parsed.output.thread_id}`)
      peer.send(toJson({ type: 'chat.thread.left', payload: { thread_id: parsed.output.thread_id } }))
      return
    }

    if (type === 'chat.read.update') {
      const parsed = safeParse(ChatReadUpdateInputSchema, payload ?? {})
      if (!parsed.success) {
        sendError(peer, { code: 'VALIDATION_ERROR', message: 'Invalid read payload' })
        return
      }

      try {
        const result = await markThreadReadUseCase(userId, parsed.output.thread_id, chatRepository)
        const userIds = await chatRepository.listParticipantUserIds(parsed.output.thread_id)
        const readPayload: ChatReadUpdatedPayload = {
          thread_id: result.threadId,
          user_id: result.userId,
          last_read_at: result.lastReadAt.toISOString()
        }
        publishToUsers(peer, userIds, { type: 'chat.read.updated', payload: readPayload })
      } catch (err) {
        if (err instanceof ChatThreadNotFoundError) {
          sendError(peer, { code: 'THREAD_NOT_FOUND', message: err.message })
          return
        }
        if (err instanceof ChatAccessDeniedError) {
          sendError(peer, { code: 'FORBIDDEN', message: err.message })
          return
        }
        sendError(peer, { code: 'SERVER_ERROR', message: 'Failed to update read state' })
      }
      return
    }

    if (type === 'chat.typing') {
      const parsed = safeParse(ChatTypingInputSchema, payload ?? {})
      if (!parsed.success) {
        sendError(peer, { code: 'VALIDATION_ERROR', message: 'Invalid typing payload' })
        return
      }

      const userIds = await chatRepository.listParticipantUserIds(parsed.output.thread_id)
      publishToUsers(peer, userIds, {
        type: 'chat.typing',
        payload: { thread_id: parsed.output.thread_id, user_id: userId, typing: parsed.output.typing }
      })
      return
    }

    if (type !== 'chat.message.send') {
      sendError(peer, { code: 'UNKNOWN_EVENT', message: 'Unsupported event type' })
      return
    }

    const parsed = safeParse(ChatMessageSendInputSchema, payload ?? {})
    if (!parsed.success) {
      sendError(peer, { code: 'VALIDATION_ERROR', message: 'Invalid message payload' })
      return
    }

    try {
      const { thread, message: messageDto, createdAt } = await createChatMessageUseCase(
        {
          threadId: parsed.output.thread_id,
          senderId: userId,
          type: 'user',
          content: parsed.output.content,
          metadata: parsed.output.metadata
        },
        chatRepository
      )

      await chatRepository.updateParticipantLastReadAt(parsed.output.thread_id, userId, createdAt)
      const userIds = await chatRepository.listParticipantUserIds(parsed.output.thread_id)
      const newPayload: ChatMessageNewPayload = {
        thread_id: parsed.output.thread_id,
        message: messageDto,
        temp_id: parsed.output.temp_id
      }
      publishToUsers(peer, userIds, { type: 'chat.message.new', payload: newPayload })

      if (thread.type !== 'ai') {
        return
      }

      if (!permissions.includes(PERMISSIONS.CHAT_AI_USE)) {
        sendError(peer, { code: 'FORBIDDEN', message: 'AI chat disabled' })
        return
      }

      const settings = await settingsRepository.findByUserId(userId)
      const provider = 'openai'
      const entries = parseLlmProviders(settings?.llmProviders ?? null)
      const entry = entries.find(e => e.provider?.toLowerCase() === provider)
      let apiKey = entry?.apiKey?.trim()
      if (!apiKey && provider === 'openai') {
        apiKey = settings?.llmApiKey?.trim()
      }

      const customSystemPrompt = (settings as { llmSystemPrompt?: string | null })?.llmSystemPrompt ?? null
      const history = await chatRepository.listRecentMessages(parsed.output.thread_id, 20)
      const messages: ModelMessage[] = history.map(item => ({
        role: item.type === 'assistant' ? 'assistant' : item.type === 'system' ? 'system' : 'user',
        content: item.content
      }))

      const streamId = randomUUID()
      const deltaPayloadBase = {
        thread_id: parsed.output.thread_id,
        stream_id: streamId
      }

      const aiResult = createChatCompletionStream({
        apiKey,
        customSystemPrompt,
        messages,
        onDelta: (delta) => {
          const deltaPayload: ChatMessageDeltaPayload = {
            ...deltaPayloadBase,
            delta
          }
          publishToUsers(peer, userIds, { type: 'chat.message.delta', payload: deltaPayload })
        }
      })

      const assistantText = await aiResult.text
      if (!assistantText) {
        return
      }

      const assistantMessageResult = await createChatMessageUseCase(
        {
          threadId: parsed.output.thread_id,
          senderId: null,
          type: 'assistant',
          content: assistantText
        },
        chatRepository
      )

      const assistantPayload: ChatMessageNewPayload = {
        thread_id: parsed.output.thread_id,
        message: assistantMessageResult.message
      }
      publishToUsers(peer, userIds, { type: 'chat.message.new', payload: assistantPayload })
    } catch (err) {
      if (err instanceof ChatThreadNotFoundError) {
        sendError(peer, { code: 'THREAD_NOT_FOUND', message: err.message })
        return
      }
      if (err instanceof ChatAccessDeniedError) {
        sendError(peer, { code: 'FORBIDDEN', message: err.message })
        return
      }
      const messageText = err instanceof Error ? err.message : 'Message send failed'
      sendError(peer, { code: 'SERVER_ERROR', message: messageText })
    }
  }
})
