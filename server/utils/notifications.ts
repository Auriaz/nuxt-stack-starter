import type { NotificationDTO } from '#shared/types/notification'
import type { NotificationCreateInput, NotificationRecord } from '~~/server/repositories/notification.repo'
import { notificationRepository } from '~~/server/repositories/notification.repo'
import { publishNotificationEvent } from '~~/server/utils/notificationsHub'

type NotificationEventPayload = { ids?: number[], all?: boolean }

function toNotificationDTO(record: NotificationRecord): NotificationDTO {
  return {
    id: record.id,
    type: record.type as NotificationDTO['type'],
    title: record.title,
    message: record.message,
    read: record.read,
    created_at: record.createdAt.toISOString(),
    action_url: record.actionUrl ?? undefined
  }
}

export async function createNotification(input: NotificationCreateInput): Promise<NotificationDTO> {
  const record = await notificationRepository.create(input)
  const dto = toNotificationDTO(record)
  publishNotificationEvent(input.userId, { type: 'notification.new', payload: dto })
  return dto
}

export function publishNotificationsRead(userId: number, payload: NotificationEventPayload) {
  publishNotificationEvent(userId, { type: 'notifications.read', payload })
}
