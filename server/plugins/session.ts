/**
 * Plugin Nitro: przy odczycie sesji (GET /api/_auth/session):
 * 1) Sprawdza, czy użytkownik nadal istnieje w bazie – jeśli nie, czyści sesję.
 * 2) Pobiera użytkownika z bazy z rolami i uprawnieniami i nadpisuje session.user,
 *    żeby zmiany uprawnień (np. po reseedzie lub edycji ról) były widoczne bez ponownego logowania.
 */
import { userRepository } from '~~/server/repositories/user.repo'
import { toUserDTO } from '~~/server/utils/adminDto'

export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    const user = session.user as { id?: number } | undefined
    if (!user?.id) return

    const userWithPermissions = await userRepository.findByIdWithRolePermissions(user.id)
    if (!userWithPermissions) {
      await clearUserSession(event)
      return
    }

    session.user = toUserDTO(userWithPermissions)
  })
})
