/**
 * OAuth route dla Google z użyciem nuxt-auth-utils.
 *
 * Ścieżka: GET /auth/google
 * - Pierwsze wejście przekierowuje do Google
 * - Po callbacku wywoływany jest onSuccess / onError
 *
 * Dokumentacja:
 * https://nuxt.com/modules/auth-utils#oauth-event-handlers
 */

import { getRequestHeader, setCookie } from 'h3'
import { upsertOAuthUserUseCase } from '~~/domain/auth/upsertOAuthUser.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { oauthAccountRepository } from '~~/server/repositories/oauthAccount.repo'
import { roleRepository } from '~~/server/repositories/role.repo'
import { userSessionRepository } from '~~/server/repositories/userSession.repo'
import { loginEventRepository } from '~~/server/repositories/loginEvent.repo'
import { activityLogRepository } from '~~/server/repositories/activityLog.repo'
import { APP_SESSION_ID_COOKIE } from '~~/server/utils/session-cookie'

interface GoogleUser {
  sub?: string | number
  id?: string | number
  email?: string | null
  email_verified?: boolean | null
  name?: string | null
  picture?: string | null
}

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    // Google zwraca zwykle pole `sub` lub `id` jako unikalny identyfikator
    const googleUser = user as GoogleUser
    const providerAccountId = String(googleUser.sub ?? googleUser.id)

    const sessionUser = await upsertOAuthUserUseCase(
      {
        provider: 'google',
        providerAccountId,
        email: googleUser.email ?? undefined,
        emailVerified: googleUser.email_verified ?? false,
        name: googleUser.name ?? undefined,
        avatarUrl: googleUser.picture ?? undefined
      },
      userRepository,
      oauthAccountRepository,
      roleRepository
    )

    await setUserSession(event, {
      user: sessionUser,
      loggedInAt: new Date()
    })

    const userId = sessionUser.id
    const forwarded = getRequestHeader(event, 'x-forwarded-for')
    const ipAddress = forwarded ? forwarded.split(',')[0].trim() : null
    const userAgent = getRequestHeader(event, 'user-agent') ?? null
    const deviceType = userAgent && /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop'
    const sessionToken = crypto.randomUUID()
    await userSessionRepository.create({
      userId,
      sessionToken,
      ipAddress,
      userAgent,
      location: null,
      deviceType
    })
    await loginEventRepository.create({ userId, ipAddress, location: null })
    await activityLogRepository.create({ userId, action: 'login', description: 'Google OAuth' })
    setCookie(event, APP_SESSION_ID_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production'
    })

    const query = getQuery(event)
    const returnTo = typeof query.returnTo === 'string' ? query.returnTo : '/dashboard'

    return sendRedirect(event, returnTo)
  },
  onError(event, error) {
    // eslint-disable-next-line no-console
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=oauth_google')
  }
})
