import { object, string, number, optional, boolean, picklist, array, unknown } from 'valibot'

export const NotificationSchema = object({
  id: number(),
  type: picklist(['info', 'success', 'warning', 'error']),
  title: string(),
  message: string(),
  read: boolean(),
  created_at: string(),
  action_url: optional(string())
})

export const NotificationStatsSchema = object({
  total: number(),
  unread: number(),
  read: number()
})

/**
 * Input dla PATCH /api/notifications/read (oznacz jako przeczytane)
 */
export const MarkNotificationsReadInputSchema = object({
  ids: optional(array(number())),
  all: optional(boolean())
})

export const NotificationSocketEnvelopeSchema = object({
  type: picklist(['notification.new', 'notifications.read']),
  payload: optional(unknown())
})
