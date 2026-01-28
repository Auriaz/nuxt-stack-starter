import type { ForgotPasswordInput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, type Result } from '../shared/result'
// TODO: Import email service gdy będzie dodany

/**
 * Use-case dla resetu hasła (forgot password)
 *
 * Generuje token resetu i wysyła email (gdy email service będzie dodany).
 * Dla bezpieczeństwa zawsze zwraca success, nawet jeśli email nie istnieje.
 */
export async function forgotPasswordUseCase(
  input: ForgotPasswordInput,
  repository: UserRepository
): Promise<Result<{ success: boolean }, never>> {
  // 1. Znajdź użytkownika
  const user = await repository.findByEmail(input.email)
  if (!user) {
    // Dla bezpieczeństwa nie ujawniamy czy email istnieje
    return ok({ success: true })
  }

  // 2. (Do przyszłej implementacji) Wygeneruj token resetu i zapisz w DB
  // const resetToken = crypto.randomBytes(32).toString('hex')
  // const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 godzina
  // await repository.updateResetToken(user.id, resetToken, resetTokenExpiry)

  // 4. Wyślij email z linkiem resetu
  // TODO: Implementacja email service
  // await emailService.sendResetPasswordEmail(user.email, resetToken)

  return ok({ success: true })
}
