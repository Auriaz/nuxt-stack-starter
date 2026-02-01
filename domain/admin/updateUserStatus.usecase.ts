import type { UserRepository } from '~~/server/repositories/user.repo'
import { ForbiddenError, NotFoundError } from '../shared/errors'

export type UserStatus = 'active' | 'blocked'

/**
 * Aktualizuje status użytkownika (active/blocked) na podstawie deactivatedAt.
 * Nie pozwala adminowi zablokować samego siebie.
 */
export async function updateUserStatusUseCase(
  userId: number,
  status: UserStatus,
  currentUserId: number,
  userRepository: UserRepository
) {
  if (userId === currentUserId && status === 'blocked') {
    throw new ForbiddenError('Nie możesz zablokować własnego konta')
  }

  const user = await userRepository.findById(userId)
  if (!user) {
    throw new NotFoundError('User not found')
  }

  const deactivatedAt = status === 'blocked' ? new Date() : null
  await userRepository.setDeactivatedAt(userId, deactivatedAt)

  const updated = await userRepository.findByIdWithRolePermissions(userId)
  if (!updated) {
    throw new NotFoundError('User not found')
  }
  return updated
}
