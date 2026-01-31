/**
 * GET /api/auth/me
 *
 * Endpoint do pobierania danych zalogowanego użytkownika.
 * Pobiera użytkownika z bazy (z rolami i uprawnieniami), żeby zmiany
 * uprawnień (np. po reseedzie lub edycji ról) były widoczne bez ponownego logowania.
 */
import { userRepository } from '~~/server/repositories/user.repo'
import { toUserDTO } from '~~/server/utils/adminDto'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    return { data: { user: null } }
  }

  const userId = (session.user as { id: number }).id
  const userWithPermissions = await userRepository.findByIdWithRolePermissions(userId)

  if (!userWithPermissions) {
    return { data: { user: null } }
  }

  const user = toUserDTO(userWithPermissions)
  return { data: { user } }
})
