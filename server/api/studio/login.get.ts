/**
 * GET /api/studio/login
 *
 * Custom Auth dla Nuxt Studio: wejście do Studio na podstawie sesji aplikacji
 * i uprawnienia content.manage. Ustawia sesję Studio i przekierowuje na root aplikacji.
 * Edytor Studio ładuje się w głównej aplikacji Nuxt (plugin nuxt-studio), nie na stronie /_studio.
 */
import { PERMISSIONS } from '#shared/permissions'
import type { SessionUser } from '~~/domain/auth/auth.types'

function resolveStudioRedirectTarget(returnTo: string | undefined): string {
  if (!returnTo || !returnTo.startsWith('/')) return '/'
  // /_studio to statyczna strona logowania — po zalogowaniu musimy wylądować w aplikacji, żeby plugin mógł zamontować edytor
  if (returnTo === '/_studio' || returnTo.startsWith('/_studio?')) return '/'
  return returnTo
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const returnTo = getQuery(event).returnTo as string | undefined
  const target = resolveStudioRedirectTarget(returnTo)

  if (!session?.user) {
    const redirectParam = encodeURIComponent('/_studio')
    return sendRedirect(event, `/auth/login?redirect=${redirectParam}`, 302)
  }

  const user = session.user as SessionUser & { email?: string, name?: string, avatarUrl?: string }
  if (!user || !Array.isArray(user.permissions) || !user.permissions.includes(PERMISSIONS.CONTENT_MANAGE)) {
    return sendRedirect(event, `/dashboard?studio=forbidden`, 302)
  }

  // Plugin nuxt-studio montuje edytor tylko gdy session.user.email jest niepuste (activation.js: user.value?.email)
  const studioEmail = (user.email && user.email.trim()) ? user.email.trim() : `user-${user.id}@studio.local`

  try {
    await setStudioUserSession(event, {
      name: user.name ?? user.email ?? 'User',
      email: studioEmail,
      providerId: String(user.id),
      avatar: user.avatarUrl ?? ''
    })
  } catch (err) {
    const message = err && typeof (err as Error).message === 'string' ? (err as Error).message : 'Studio session error'
    throw createError({
      statusCode: 503,
      statusMessage: 'Studio login failed',
      message: message.includes('access token') ? 'Ustaw STUDIO_GITHUB_TOKEN (lub STUDIO_GITLAB_TOKEN) w .env — zob. docs Nuxt Studio (Git Providers).' : message
    })
  }

  return sendRedirect(event, target, 302)
})
