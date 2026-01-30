/**
 * Use-case: tymczasowa dezaktywacja konta użytkownika z weryfikacją hasła.
 * Ustawia deactivatedAt; użytkownik nie ma dostępu do konta do ponownego logowania (logowanie reaktywuje).
 */
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError, UnauthorizedError } from '../shared/errors'
// verifyPassword z nuxt-auth-utils (Nitro auto-import)

export async function deactivateAccountUseCase(
  userId: number,
  password: string,
  userRepository: UserRepository
): Promise<Result<{ ok: true }, NotFoundError | UnauthorizedError>> {
  const user = await userRepository.findById(userId)
  if (!user) {
    return err(new NotFoundError('User not found'))
  }

  const storedPassword = (user as { password?: string | null }).password
  if (!storedPassword || storedPassword === '') {
    return err(new UnauthorizedError('Konto zalogowane przez serwis zewnętrzny nie ma lokalnego hasła. Nie można deaktywować w ten sposób.'))
  }

  const isValid = await verifyPassword(storedPassword, password)
  if (!isValid) {
    return err(new UnauthorizedError('Nieprawidłowe hasło'))
  }

  await userRepository.setDeactivatedAt(userId, new Date())
  return ok({ ok: true })
}
