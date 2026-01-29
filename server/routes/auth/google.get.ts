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

import { upsertOAuthUserUseCase } from '~~/domain/auth/upsertOAuthUser.usecase'
import { userRepository } from '~~/server/repositories/user.repo'
import { oauthAccountRepository } from '~~/server/repositories/oauthAccount.repo'
import { roleRepository } from '~~/server/repositories/role.repo'

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
