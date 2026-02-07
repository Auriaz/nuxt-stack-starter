/**
 * POST /api/auth/logout
 *
 * Zapisuje akcję logout w ActivityLog, czyści sesję (nuxt-auth-utils) oraz sesję Nuxt Studio.
 */
import { activityLogRepository } from '~~/server/repositories/activityLog.repo'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const userId = session?.user ? (session.user as { id: number }).id : null
  if (userId) {
    await activityLogRepository.create({ userId, action: 'logout', description: null })
  }

  await clearUserSession(event)

  try {
    await clearStudioUserSession(event)
  } catch {
    // Sesja Studio może nie istnieć lub moduł nie być skonfigurowany — nie blokujemy wylogowania
  }

  return {
    data: {
      ok: true
    }
  }
})
