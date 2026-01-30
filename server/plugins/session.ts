/**
 * Plugin Nitro: przy odczycie sesji sprawdza, czy użytkownik nadal istnieje w bazie.
 * Jeśli konto zostało usunięte (np. DELETE /api/profile/me), sesja jest czyszczona –
 * po odświeżeniu użytkownik nie będzie już zalogowany.
 */
import { userRepository } from '~~/server/repositories/user.repo'

export default defineNitroPlugin(() => {
  sessionHooks.hook('fetch', async (session, event) => {
    const user = session.user as { id?: number } | undefined
    if (!user?.id) return

    const exists = await userRepository.findById(user.id)
    if (!exists) {
      await clearUserSession(event)
    }
  })
})
