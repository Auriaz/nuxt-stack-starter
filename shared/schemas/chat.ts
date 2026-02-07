import { object, string, number, optional, picklist, boolean, unknown, array } from 'valibot'

export const ChatThreadTypeSchema = picklist(['ai', 'dm', 'room'])
export const ChatMessageTypeSchema = picklist(['user', 'assistant', 'system'])

export const ChatThreadTopicSchema = object({
  id: number(),
  thread_id: number(),
  slug: string(),
  label: string(),
  order: number(),
  created_at: string()
})

export const ChatThreadSchema = object({
  id: number(),
  type: ChatThreadTypeSchema,
  title: optional(string()),
  created_at: string(),
  last_message_at: optional(string()),
  topics: optional(array(ChatThreadTopicSchema))
})

export const ChatParticipantSchema = object({
  user_id: number(),
  role: string(),
  joined_at: string(),
  last_read_at: optional(string())
})

export const ChatMessageSchema = object({
  id: number(),
  thread_id: number(),
  sender_id: optional(number()),
  type: ChatMessageTypeSchema,
  content: string(),
  metadata: optional(unknown()),
  created_at: string()
})

export const ChatMessageSendInputSchema = object({
  thread_id: number(),
  content: string(),
  temp_id: optional(string()),
  metadata: optional(unknown())
})

export const ChatThreadJoinInputSchema = object({
  thread_id: number()
})

export const ChatThreadLeaveInputSchema = object({
  thread_id: number()
})

export const ChatReadUpdateInputSchema = object({
  thread_id: number(),
  last_read_at: optional(string())
})

export const ChatTypingInputSchema = object({
  thread_id: number(),
  typing: boolean()
})

export const ChatSocketEnvelopeSchema = object({
  type: string(),
  payload: optional(unknown())
})

export const ChatMessageDeltaPayloadSchema = object({
  thread_id: number(),
  stream_id: string(),
  delta: string()
})

export const ChatMessageNewPayloadSchema = object({
  thread_id: number(),
  message: ChatMessageSchema,
  temp_id: optional(string())
})

export const ChatReadUpdatedPayloadSchema = object({
  thread_id: number(),
  user_id: number(),
  last_read_at: string()
})

export const ChatErrorPayloadSchema = object({
  code: string(),
  message: string()
})
