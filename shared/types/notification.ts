import type { InferOutput } from 'valibot'
import type { NotificationSchema, NotificationStatsSchema } from '../schemas/notification'

export type Notification = InferOutput<typeof NotificationSchema>
export type NotificationDTO = Notification
export type NotificationStats = InferOutput<typeof NotificationStatsSchema>

/**
 * Odpowiedź GET /api/notifications (lista + unread count)
 */
export interface NotificationsListDTO {
  items: Notification[]
  unreadCount: number
}
