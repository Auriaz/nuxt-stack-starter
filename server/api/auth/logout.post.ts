/**
 * POST /api/auth/logout
 *
 * Czyści sesję użytkownika (nuxt-auth-utils).
 */

export default defineEventHandler(async (event) => {
  await clearUserSession(event)

  return {
    data: {
      ok: true
    }
  }
})
