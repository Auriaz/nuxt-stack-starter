import type { InferOutput } from 'valibot'
import type {
  ChatThreadSchema,
  ChatParticipantSchema,
  ChatMessageSchema,
  ChatMessageSendInputSchema,
  ChatThreadJoinInputSchema,
  ChatThreadLeaveInputSchema,
  ChatReadUpdateInputSchema,
  ChatTypingInputSchema,
  ChatDmOpenInputSchema,
  ChatTeamThreadCreateInputSchema,
  ChatParticipantWithUserSchema,
  ChatMessageDeltaPayloadSchema,
  ChatMessageNewPayloadSchema,
  ChatReadUpdatedPayloadSchema,
  ChatErrorPayloadSchema,
  ChatThreadTypeSchema,
  ChatMessageTypeSchema,
  ChatThreadTopicSchema
} from '../schemas/chat'

export type ChatThreadType = InferOutput<typeof ChatThreadTypeSchema>
export type ChatMessageType = InferOutput<typeof ChatMessageTypeSchema>

export type ChatThreadDTO = InferOutput<typeof ChatThreadSchema>
export type ChatThreadTopicDTO = InferOutput<typeof ChatThreadTopicSchema>
export type ChatParticipantDTO = InferOutput<typeof ChatParticipantSchema>
export type ChatParticipantWithUserDTO = InferOutput<typeof ChatParticipantWithUserSchema>
export type ChatMessageDTO = InferOutput<typeof ChatMessageSchema>

export type ChatMessageSendInput = InferOutput<typeof ChatMessageSendInputSchema>
export type ChatThreadJoinInput = InferOutput<typeof ChatThreadJoinInputSchema>
export type ChatThreadLeaveInput = InferOutput<typeof ChatThreadLeaveInputSchema>
export type ChatReadUpdateInput = InferOutput<typeof ChatReadUpdateInputSchema>
export type ChatTypingInput = InferOutput<typeof ChatTypingInputSchema>
export type ChatDmOpenInput = InferOutput<typeof ChatDmOpenInputSchema>
export type ChatTeamThreadCreateInput = InferOutput<typeof ChatTeamThreadCreateInputSchema>

export type ChatMessageDeltaPayload = InferOutput<typeof ChatMessageDeltaPayloadSchema>
export type ChatMessageNewPayload = InferOutput<typeof ChatMessageNewPayloadSchema>
export type ChatReadUpdatedPayload = InferOutput<typeof ChatReadUpdatedPayloadSchema>
export type ChatErrorPayload = InferOutput<typeof ChatErrorPayloadSchema>

export type ChatSocketEventType
  = | 'chat.message.send'
    | 'chat.message.new'
    | 'chat.message.delta'
    | 'chat.thread.join'
    | 'chat.thread.joined'
    | 'chat.thread.leave'
    | 'chat.thread.left'
    | 'chat.read.update'
    | 'chat.read.updated'
    | 'chat.typing'
    | 'chat.error'

export interface ChatSocketEnvelope<T = unknown> {
  type: ChatSocketEventType
  payload?: T
}
