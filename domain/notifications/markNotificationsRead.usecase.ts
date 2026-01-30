/**
 * Use-case: oznaczanie powiadomień jako przeczytane (po ID lub wszystkie).
 */

import type { NotificationRepository } from '~~/server/repositories/notification.repo'

export interface MarkNotificationsReadInput {
  ids?: number[]
  all?: boolean
}

export async function markNotificationsReadUseCase(
  userId: number,
  input: MarkNotificationsReadInput,
  notificationRepository: NotificationRepository
): Promise<{ updated: number }> {
  if (input.all) {
    const updated = await notificationRepository.markAllAsReadByUserId(userId)
    return { updated }
  }

  if (input.ids && input.ids.length > 0) {
    const updated = await notificationRepository.markAsReadByIds(userId, input.ids)
    return { updated }
  }

  return { updated: 0 }
}
