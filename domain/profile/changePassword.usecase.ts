/**
 * Use-case: zmiana hasła zalogowanego użytkownika (obecne hasło + nowe hasło).
 */
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { UnauthorizedError, NotFoundError } from '../shared/errors'
// hashPassword, verifyPassword z nuxt-auth-utils (Nitro auto-import)

export async function changePasswordUseCase(
  userId: number,
  currentPassword: string,
  newPassword: string,
  userRepository: UserRepository
): Promise<Result<{ ok: true }, UnauthorizedError | NotFoundError>> {
  const user = await userRepository.findById(userId)
  if (!user) {
    return err(new NotFoundError('User not found'))
  }

  const isValid = await verifyPassword(user.password, currentPassword)
  if (!isValid) {
    return err(new UnauthorizedError('Obecne hasło jest nieprawidłowe'))
  }

  const hashedPassword = await hashPassword(newPassword)
  await userRepository.updatePassword(userId, hashedPassword)
  await userRepository.updatePasswordChangedAt(userId, new Date())

  return ok({ ok: true })
}
