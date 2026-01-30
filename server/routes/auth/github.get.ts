/**
 * OAuth route dla GitHub z użyciem nuxt-auth-utils.
 *
 * Ścieżka: GET /auth/github
 * - Pierwsze wejście przekierowuje do GitHub
 * - Po callbacku wywoływany jest onSuccess / onError
 *
 * Dokumentacja:
 * https://github.com/atinux/nuxt-auth-utils#oauth-event-handlers
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

export default defineOAuthGitHubEventHandler({
  config: {
    // Wymagamy emaila od GitHub, żeby uprościć mapowanie do User
    emailRequired: true
  },
  async onSuccess(event, { user }) {
    // user shape zgodnie z GitHub API:
    // https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
    const sessionUser = await upsertOAuthUserUseCase(
      {
        provider: 'github',
        providerAccountId: String(user.id),
        email: user.email ?? undefined,
        // GitHub nie zwraca jawnie emailVerified, zakładamy true gdy emailRequired
        emailVerified: true,
        name: user.name || user.login || undefined,
        avatarUrl: user.avatar_url || undefined
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
    await activityLogRepository.create({ userId, action: 'login', description: 'GitHub OAuth' })
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
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/auth/login?error=oauth_github')
  }
})
