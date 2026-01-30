/**
 * Use-case: usunięcie konta użytkownika.
 * Powinno być wywołane po usunięciu plików użytkownika ze storage (w handlerze).
 */
import type { UserRepository } from '~~/server/repositories/user.repo'
import { ok, err, type Result } from '../shared/result'
import { NotFoundError } from '../shared/errors'

export async function deleteAccountUseCase(
  userId: number,
  userRepository: UserRepository
): Promise<Result<{ ok: true }, NotFoundError>> {
  const user = await userRepository.findById(userId)
  if (!user) {
    return err(new NotFoundError('User not found'))
  }

  await userRepository.delete(userId)
  return ok({ ok: true })
}
