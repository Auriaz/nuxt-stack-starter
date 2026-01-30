/**
 * Use-case: aktualizacja ustawień prywatności użytkownika (showEmail).
 */
import type { UpdatePrivacyInput } from '#shared/types'
import type { UserRepository } from '~~/server/repositories/user.repo'

export async function updatePrivacyUseCase(
  userId: number,
  data: UpdatePrivacyInput,
  userRepository: UserRepository
): Promise<void> {
  await userRepository.updatePrivacy(userId, { showEmail: data.showEmail })
}
