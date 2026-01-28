// useUserSession jest auto-importowane przez nuxt-auth-utils

/**
 * Middleware dla stron auth (login, register, forgot-password, reset-password)
 *
 * Redirect do /dashboard jeśli użytkownik jest już zalogowany.
 */
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()

  if (loggedIn.value) {
    return navigateTo('/dashboard')
  }
})
