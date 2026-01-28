/**
 * Use-case dla logowania użytkownika
 *
 * Weryfikuje dane logowania i zwraca dane użytkownika.
 * Sesja jest ustawiana w endpoincie przez setUserSession().
 */

import type { LoginInput, AuthOutput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { UnauthorizedError } from '../shared/errors'
// verifyPassword jest auto-importowane przez nuxt-auth-utils

export async function loginUseCase(
  input: LoginInput,
  repository: UserRepository
): Promise<Result<AuthOutput, UnauthorizedError>> {
  // 1. Znajdź użytkownika po emailu
  const user = await repository.findByEmail(input.email)
  if (!user) {
    return err(new UnauthorizedError('Invalid email or password'))
  }

  // 2. Zweryfikuj hasło (nuxt-auth-utils używa scrypt)
  const isValid = await verifyPassword(user.password, input.password)
  if (!isValid) {
    return err(new UnauthorizedError('Invalid email or password'))
  }

  // 3. Zwróć dane użytkownika (bez hasła)
  return ok({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  })
}
