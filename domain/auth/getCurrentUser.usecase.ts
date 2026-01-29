import type { SessionUser } from './auth.types'
import type { UserRepository } from '~~/server/repositories/user.repo'

/**
 * Use-case: pobranie aktualnego użytkownika.
 *
 * MVP: zwraca po prostu SessionUser przekazany z sesji.
 * v2: może dociągać pełniejsze dane z bazy (np. dla dashboardu lub RBAC).
 */
export async function getCurrentUserUseCase(
  sessionUser: SessionUser | null,
  _userRepository: UserRepository
): Promise<SessionUser | null> {
  // MVP: Sesja zawiera wystarczające dane do wyświetlenia w UI.
  // TODO[area=auth,priority=low]: W przyszłości można opcjonalnie użyć userRepository do dociągnięcia pełnego profilu.
  if (!sessionUser) {
    return null
  }

  return sessionUser
}
