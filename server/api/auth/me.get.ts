/**
 * GET /api/auth/me
 *
 * Endpoint do pobierania danych zalogowanego użytkownika.
 * Zwraca dane użytkownika z sesji (nuxt-auth-utils).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    return { data: { user: null } }
  }

  return { data: { user: session.user } }
})
