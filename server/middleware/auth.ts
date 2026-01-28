/**
 * Middleware do ochrony endpointów API wymagających autoryzacji
 *
 * Automatycznie sprawdza sesję i dodaje user do event.context.
 * Publiczne endpointy auth są pomijane.
 *
 * @example
 * ```ts
 * // W endpoincie:
 * export default defineEventHandler(async (event) => {
 *   // Middleware automatycznie sprawdza autoryzację
 *   const user = event.context.user // Dostęp do użytkownika
 *   // ...
 * })
 * ```
 */
export default defineEventHandler(async (event) => {
  // Middleware działa tylko dla endpointów API (nie dla stron publicznych)
  if (!event.path.startsWith('/api/')) {
    return
  }

  // Pomiń middleware dla publicznych endpointów auth
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/health',
    // Publiczny endpoint formularza kontaktowego
    '/api/contact'
  ]
  if (event.path.startsWith('/api/_nuxt_icon')) {
    return
  }
  if (publicPaths.includes(event.path)) {
    return
  }

  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      status: 401,
      statusText: 'Unauthorized',
      data: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      }
    })
  }

  // Dodaj użytkownika do context (dostępne w endpointach)
  event.context.user = session.user
})
