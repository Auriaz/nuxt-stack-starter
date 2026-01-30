/**
 * Use-case: listowanie powiadomień użytkownika.
 * Zwraca NotificationsListDTO (items + unreadCount).
 */

import type { NotificationRepository } from '~~/server/repositories/notification.repo'
import type { NotificationsListDTO, NotificationDTO } from '#shared/types'

function toNotificationDTO(record: { id: number, type: string, title: string, message: string, read: boolean, actionUrl: string | null, createdAt: Date }): NotificationDTO {
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

export async function listNotificationsUseCase(
  userId: number,
  notificationRepository: NotificationRepository,
  limit?: number
): Promise<NotificationsListDTO> {
  const items = await notificationRepository.findManyByUserId(userId, limit)
  const unreadCount = await notificationRepository.countUnreadByUserId(userId)

  return {
    items: items.map(toNotificationDTO),
    unreadCount
  }
}
