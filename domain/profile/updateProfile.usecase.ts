/**
 * Use-case: aktualizacja profilu użytkownika (name, avatarUrl).
 */

import type { UserRepository } from '~~/server/repositories/user.repo'
import type { ProfileDTO, UpdateProfileInput } from '#shared/types'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError } from '../shared/errors'

export async function updateProfileUseCase(
  userId: number,
  input: UpdateProfileInput,
  userRepository: UserRepository
): Promise<Result<ProfileDTO, NotFoundError>> {
  const user = await userRepository.findById(userId)
  if (!user) {
    return err(new NotFoundError('User not found'))
  }

  const updated = await userRepository.updateProfile(userId, {
    name: input.name,
    avatarUrl: input.avatarUrl,
    bio: input.bio
  })

  return ok({
    id: updated.id,
    email: updated.email,
    username: updated.username,
    name: updated.name ?? undefined,
    avatarUrl: updated.avatarUrl ?? undefined,
    bio: updated.bio ?? undefined,
    role: updated.role,
    emailVerifiedAt: updated.emailVerifiedAt?.toISOString()
  })
}
