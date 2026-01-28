/**
 * Use-case dla rejestracji użytkownika z weryfikacją e-mail
 *
 * Waliduje dane, sprawdza unikalność, hashuje hasło i tworzy użytkownika.
 * Tworzy również token weryfikacyjny i wysyła maila weryfikacyjnego.
 * Sesja NIE jest ustawiana tutaj – logika sesji należy do endpointu.
 */

import type { RegisterInput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import type { EmailVerificationTokenRepository } from '~~/server/repositories/emailVerificationToken.repo'
import { ok, err, type Result } from '../shared/result'
import { DuplicateError } from '../shared/errors'
import { generateSecureToken, hashToken } from '~~/server/services/security/token.service'
import { sendVerificationEmail } from '~~/server/services/email/email.service'
// hashPassword jest auto-importowane przez nuxt-auth-utils

type RegisterUseCaseSuccess = { ok: true }

export async function registerUseCase(
  input: RegisterInput,
  userRepository: UserRepository,
  tokenRepository: EmailVerificationTokenRepository
): Promise<Result<RegisterUseCaseSuccess, DuplicateError>> {
  // 1. Sprawdź czy email już istnieje
  const existingEmail = await userRepository.findByEmail(input.email)
  if (existingEmail) {
    return err(new DuplicateError('User with this email already exists'))
  }

  // 2. Sprawdź czy username już istnieje
  const existingUsername = await userRepository.findByUsername(input.username)
  if (existingUsername) {
    return err(new DuplicateError('User with this username already exists'))
  }

  // 3. Hash hasła (nuxt-auth-utils używa scrypt)
  const hashedPassword = await hashPassword(input.password)

  // 4. Utwórz użytkownika z nieweryfikowanym e-mailem
  const user = await userRepository.create({
    email: input.email,
    username: input.username,
    password: hashedPassword
  })

  // 5. Wygeneruj token weryfikacyjny
  const plainToken = generateSecureToken()
  const tokenHash = hashToken(plainToken)

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)

  await tokenRepository.create({
    userId: user.id,
    tokenHash,
    expiresAt
  })

  // 6. Wyślij e-mail weryfikacyjny
  const verificationPath = `/auth/verify-email?token=${plainToken}`
  await sendVerificationEmail(user.email, verificationPath)

  // 7. Zwróć prosty sukces
  return ok({ ok: true })
}
