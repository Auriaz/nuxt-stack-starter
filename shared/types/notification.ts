import type { InferOutput } from 'valibot'
import type { NotificationSchema, NotificationStatsSchema, NotificationSocketEnvelopeSchema } from '../schemas/notification'

export type Notification = InferOutput<typeof NotificationSchema>
export type NotificationDTO = Notification
export type NotificationStats = InferOutput<typeof NotificationStatsSchema>
export type NotificationSocketEnvelope = InferOutput<typeof NotificationSocketEnvelopeSchema>
export type NotificationSocketType = NotificationSocketEnvelope['type']

export interface NotificationsReadPayload {
  ids?: number[]
  all?: boolean
}

/**
 * Odpowiedź GET /api/notifications (lista + unread count)
 */
export interface NotificationsListDTO {
  items: Notification[]
  unreadCount: number
}
