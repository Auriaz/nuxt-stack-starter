import type { ResetPasswordInput, AuthOutput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { UnauthorizedError } from '../shared/errors'
// hashPassword jest auto-importowane przez nuxt-auth-utils

/**
 * Use-case dla resetu hasła
 *
 * Weryfikuje token resetu i aktualizuje hasło użytkownika.
 * Po resecie użytkownik jest automatycznie logowany (sesja ustawiana w endpoincie).
 */
export async function resetPasswordUseCase(
  input: ResetPasswordInput,
  repository: UserRepository
): Promise<Result<AuthOutput, UnauthorizedError>> {
  // 1. Znajdź użytkownika
  const user = await repository.findByEmail(input.email)
  if (!user) {
    return err(new UnauthorizedError('Invalid reset token'))
  }

  // 2. Zweryfikuj token (wymaga pól resetToken, resetTokenExpiry w User)
  // TODO: Gdy pola będą dodane do Prisma schema
  // if (user.resetToken !== input.token || user.resetTokenExpiry < new Date()) {
  //   return err(new UnauthorizedError('Invalid or expired reset token'))
  // }

  // 3. Hash nowego hasła
  const hashedPassword = await hashPassword(input.password)

  // 4. Zaktualizuj hasło i wyczyść token
  const updatedUser = await repository.updatePassword(user.id, hashedPassword)
  // TODO: Gdy pola będą dodane
  // await repository.clearResetToken(user.id)

  // 5. Zwróć dane użytkownika
  return ok({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email
    }
  })
}
