/**
 * POST /api/studio/logout
 *
 * Wylogowanie z Nuxt Studio — czyści sesję Studio (ciasteczka). Sesja aplikacji (nuxt-auth-utils) pozostaje.
 * Gdy wywołane z klienta (Accept: application/json) zwraca JSON, żeby przeglądarka odebrała odpowiedź z Set-Cookie.
 */
export default defineEventHandler(async (event) => {
  await clearStudioUserSession(event)
  const accept = getRequestHeader(event, 'accept') || ''
  if (accept.includes('application/json')) {
    return { ok: true }
  }
  return sendRedirect(event, '/dashboard', 302)
})
