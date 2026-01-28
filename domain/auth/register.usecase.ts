/**
 * Use-case dla rejestracji użytkownika
 *
 * Waliduje dane, sprawdza unikalność, hashuje hasło i tworzy użytkownika.
 * Sesja jest ustawiana w endpoincie przez setUserSession().
 */

import type { RegisterInput, AuthOutput } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { DuplicateError } from '../shared/errors'
// hashPassword jest auto-importowane przez nuxt-auth-utils

export async function registerUseCase(
  input: RegisterInput,
  repository: UserRepository
): Promise<Result<AuthOutput, DuplicateError>> {
  // 1. Sprawdź czy email już istnieje
  const existingEmail = await repository.findByEmail(input.email)
  if (existingEmail) {
    return err(new DuplicateError('User with this email already exists'))
  }

  // 2. Sprawdź czy username już istnieje
  const existingUsername = await repository.findByUsername(input.username)
  if (existingUsername) {
    return err(new DuplicateError('User with this username already exists'))
  }

  // 3. Hash hasła (nuxt-auth-utils używa scrypt)
  const hashedPassword = await hashPassword(input.password)

  // 4. Utwórz użytkownika
  const user = await repository.create({
    email: input.email,
    username: input.username,
    password: hashedPassword
  })

  // 5. Zwróć dane użytkownika (bez hasła)
  return ok({
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  })
}
