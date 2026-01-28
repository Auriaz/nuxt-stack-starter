import type { ForgotPasswordInput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import type { PasswordResetTokenRepository } from '~~/server/repositories/passwordResetToken.repo'
import { ok, type Result } from '../shared/result'
import { generateSecureToken, hashToken } from '~~/server/services/security/token.service'
import { sendPasswordResetEmail } from '~~/server/services/email/email.service'

/**
 * Use-case dla żądania resetu hasła (forgot password)
 *
 * Generuje token resetu i wysyła email.
 * Dla bezpieczeństwa zawsze zwraca success, nawet jeśli email nie istnieje.
 */
export async function requestPasswordResetUseCase(
  input: ForgotPasswordInput,
  userRepository: UserRepository,
  tokenRepository: PasswordResetTokenRepository,
  requestIp?: string,
  userAgent?: string
): Promise<Result<{ ok: true }, never>> {
  // 1. Znajdź użytkownika
  const user = await userRepository.findByEmail(input.email)

  // 2. Zawsze zwróć success (security: nie ujawniaj czy email istnieje)
  if (!user) {
    return ok({ ok: true })
  }

  // 3. Unieważnij wszystkie istniejące tokeny dla użytkownika
  await tokenRepository.invalidateForUser(user.id)

  // 4. Wygeneruj nowy token
  const plainToken = generateSecureToken()
  const tokenHash = hashToken(plainToken)

  const expiresAt = new Date()
  expiresAt.setMinutes(expiresAt.getMinutes() + 60) // 60 minut TTL

  await tokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt,
    requestIp,
    userAgent
  })

  // 5. Wyślij email z linkiem resetu
  const resetPath = `/auth/reset-password?token=${plainToken}`
  await sendPasswordResetEmail(user.email, resetPath)

  return ok({ ok: true })
}
