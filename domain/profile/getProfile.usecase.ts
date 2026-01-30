/**
 * Use-case: pobranie profilu użytkownika po ID.
 * Zwraca ProfileDTO (dane do wyświetlenia w dashboardzie).
 */

import type { UserRepository } from '~~/server/repositories/user.repo'
import type { ProfileDTO } from '#shared/types'

export async function getProfileUseCase(
  userId: number,
  userRepository: UserRepository
): Promise<ProfileDTO | null> {
  const user = await userRepository.findById(userId)
  if (!user) return null

  const userRecord = user as Record<string, unknown>
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name ?? undefined,
    avatarUrl: user.avatarUrl ?? undefined,
    bio: user.bio ?? undefined,
    role: user.role,
    emailVerifiedAt: user.emailVerifiedAt?.toISOString(),
    showEmail: userRecord.showEmail === false ? false : true
  }
}
