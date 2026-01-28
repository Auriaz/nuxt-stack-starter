import type { ResetPasswordInput, ResetPasswordOutput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import type { PasswordResetTokenRepository } from '~~/server/repositories/passwordResetToken.repo'
import { ok, err, type Result } from '../shared/result'
import {
  TokenInvalidError,
  TokenExpiredError,
  TokenAlreadyUsedError,
  ValidationError
} from '../shared/errors'
import { hashToken } from '~~/server/services/security/token.service'
// hashPassword jest auto-importowane przez nuxt-auth-utils

/**
 * Use-case dla resetu hasła
 *
 * Weryfikuje token resetu i aktualizuje hasło użytkownika.
 * Po resecie użytkownik jest automatycznie logowany (sesja ustawiana w endpoincie).
 */
export async function resetPasswordUseCase(
  input: ResetPasswordInput,
  tokenRepository: PasswordResetTokenRepository,
  userRepository: UserRepository
): Promise<Result<ResetPasswordOutput, TokenInvalidError | TokenExpiredError | TokenAlreadyUsedError | ValidationError>> {
  // 1. Walidacja password === passwordConfirm
  if (input.password !== input.passwordConfirm) {
    return err(new ValidationError('Passwords do not match'))
  }

  // 2. Hash tokena i znajdź rekord
  const tokenHash = hashToken(input.token)
  const record = await tokenRepository.findByTokenHash(tokenHash)

  if (!record) {
    return err(new TokenInvalidError())
  }

  const now = new Date()

  // 3. Sprawdź czy token został użyty
  if (record.usedAt) {
    return err(new TokenAlreadyUsedError())
  }

  // 4. Sprawdź czy token wygasł
  if (record.expiresAt <= now) {
    return err(new TokenExpiredError())
  }

  // 5. Hash nowego hasła
  const hashedPassword = await hashPassword(input.password)

  // 6. Zaktualizuj hasło i passwordChangedAt
  await userRepository.updatePassword(record.userId, hashedPassword)
  await userRepository.updatePasswordChangedAt(record.userId, now)

  // 7. Oznacz token jako użyty
  await tokenRepository.markUsed(record.id, now)

  // 8. Zwróć dane użytkownika
  return ok({
    ok: true,
    user: {
      id: record.user.id,
      username: record.user.username,
      email: record.user.email
    }
  })
}
