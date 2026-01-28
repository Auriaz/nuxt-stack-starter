// useUserSession jest auto-importowane przez nuxt-auth-utils

/**
 * Middleware do ochrony stron wymagających autoryzacji
 *
 * Redirect do /auth/login jeśli użytkownik nie jest zalogowany.
 * Zapamiętuje redirect URL w query string.
 */
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  if (!loggedIn.value) {
    return navigateTo(`/auth/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
