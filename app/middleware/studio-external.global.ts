/**
 * Ścieżki /__nuxt_studio/* są obsługiwane przez Nitro (nuxt-studio), nie przez Vue Router.
 * Wymuszamy pełne przeładowanie, żeby Vue Router nie próbował dopasować trasy i nie wyświetlał ostrzeżenia.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.path.startsWith('/__nuxt_studio/')) {
    return navigateTo(to.fullPath, { external: true })
  }
})
