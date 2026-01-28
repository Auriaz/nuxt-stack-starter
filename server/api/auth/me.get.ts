/**
 * GET /api/auth/me
 *
 * Endpoint do pobierania danych zalogowanego użytkownika.
 * Zwraca dane użytkownika z sesji (nuxt-auth-utils).
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated'
        }
      }
    })
  }

  return { data: { user: session.user } }
})
