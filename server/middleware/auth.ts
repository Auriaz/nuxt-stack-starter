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
  const rawPath = event.path || ''

  // Middleware działa tylko dla endpointów API (nie dla stron publicznych)
  if (!rawPath.startsWith('/api/')) {
    return
  }

  // Bardzo ważne: nie blokuj internal route używanego przez nuxt-auth-utils
  // do zarządzania sesją (`/api/_auth/session` itp.)
  if (rawPath.startsWith('/api/_auth/')) {
    return
  }

  // Znormalizowana ścieżka bez query string (np. ?token=...)
  const normalizedPath = rawPath.split('?')[0]

  // WebSocket endpoints have their own auth checks in the WS handler
  if (normalizedPath.startsWith('/api/ws/')) {
    return
  }

  // Pomiń middleware dla publicznych endpointów auth
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/auth/resend-verification',
    '/api/health',

    // Publiczny endpoint formularza kontaktowego
    '/api/contact',
    // Studio Custom Auth — handler sam sprawdza sesję i przekierowuje niezalogowanych
    '/api/studio/login',
    // Publiczne endpointy bloga
    '/api/blog',
    '/api/media'
  ]
  // @ts-expect-error normalizedPath jest zawsze zdefiniowane po ustawieniu rawPath
  if (normalizedPath.startsWith('/api/_nuxt_icon')) {
    return
  }

  // Obsłuż zarówno dokładne ścieżki, jak i warianty z ukośnikiem na końcu
  // @ts-expect-error normalizedPath jest zawsze zdefiniowane po ustawieniu rawPath
  if (publicPaths.some(path => normalizedPath === path || normalizedPath.startsWith(`${path}/`))) {
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
          message: 'Authentication required. Please login to continue.'
        }
      }
    })
  }

  // Dodaj użytkownika do context (dostępne w endpointach)
  event.context.user = session.user
})
