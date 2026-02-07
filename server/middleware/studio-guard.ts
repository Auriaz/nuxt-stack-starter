const STUDIO_OAUTH_PATHS = ['/__nuxt_studio/auth/github', '/__nuxt_studio/auth/gitlab', '/__nuxt_studio/auth/google']

/**
 * Ochrona trasy Nuxt Studio (/_studio): brak sesji Studio → redirect na /api/studio/login.
 * Użytkownik musi wcześniej zalogować się do Studio przez GET /api/studio/login (Custom Auth).
 * Gdy brak sessionSecret (np. konfiguracja modułu), i tak przekierowujemy — niezalogowany nie może wejść.
 *
 * Tylko ścieżki OAuth (github, gitlab, google) przekierowujemy na Custom Auth.
 * /__nuxt_studio/auth/session NIE przekierowujemy — plugin używa GET session do odczytu sesji (200 + JSON).
 */
export default defineEventHandler(async (event) => {
  const path = event.path || ''

  if (STUDIO_OAUTH_PATHS.some(oauthPath => path === oauthPath || path.startsWith(oauthPath + '?'))) {
    const returnTo = encodeURIComponent('/_studio')
    return sendRedirect(event, `/api/studio/login?returnTo=${returnTo}`, 302)
  }

  if (!path.startsWith('/_studio')) {
    return
  }

  const config = useRuntimeConfig(event)
  const sessionSecret = config.studio?.auth?.sessionSecret

  if (!sessionSecret) {
    const returnTo = encodeURIComponent(path)
    return sendRedirect(event, `/api/studio/login?returnTo=${returnTo}`, 302)
  }

  const session = await useSession(event, {
    name: 'studio-session',
    password: sessionSecret,
    cookie: {
      secure: getRequestProtocol(event) === 'https',
      path: '/'
    }
  })

  if (!session.data || !(session.data as { user?: unknown }).user) {
    const returnTo = encodeURIComponent(path)
    return sendRedirect(event, `/api/studio/login?returnTo=${returnTo}`, 302)
  }
})
