// useUserSession jest auto-importowane przez nuxt-auth-utils
import { useAuthResource } from './resources/useAuthResource'
import { useProfile } from './resources/useProfile'
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '#shared/types/auth'
// useToast jest auto-importowane przez @nuxt/ui

/**
 * Composable do zarządzania stanem autoryzacji
 *
 * Integracja z nuxt-auth-utils przez useUserSession().
 * Zapewnia metody login, register, logout, forgotPassword, resetPassword.
 *
 * @example
 * ```ts
 * const { user, isLoggedIn, login, logout } = useAuth()
 * if (!isLoggedIn.value) {
 *   await login({ email: 'user@example.com', password: 'password' })
 * }
 * ```
 */
export function useAuth() {
  const session = useUserSession()
  const authResource = useAuthResource()
  const toast = useToast()
  const router = useRouter()

  // Stan z nuxt-auth-utils
  const user = computed(() => session.user.value || null)
  const isLoggedIn = computed(() => session.loggedIn.value)
  const isLoading = computed(() => !session.ready.value)

  async function login(input: LoginInput): Promise<boolean> {
    try {
      await authResource.login(input)

      // Odśwież sesję (nuxt-auth-utils automatycznie odczyta z cookies)
      await session.fetch()

      // Wyczyść stan profilu poprzedniego użytkownika – nowy fetch pobierze dane zalogowanego
      const { clearProfile } = useProfile()
      clearProfile()

      toast.add({
        title: 'Sukces',
        description: 'Zalogowano pomyślnie',
        color: 'success'
      })

      // Redirect do dashboard lub zapisanego redirect
      const redirect = router.currentRoute.value.query.redirect as string
      await router.push(redirect || '/dashboard')

      return true
    } catch (error: unknown) {
      // Re-throw błąd, żeby formularz mógł go obsłużyć przez setErrorsFromApi
      // Toast będzie wyświetlony tylko jeśli błąd nie zostanie obsłużony w formularzu
      const message = error instanceof Error ? error.message : 'Nie udało się zalogować'
      toast.add({
        title: 'Błąd logowania',
        description: message,
        color: 'error'
      })
      throw error
    }
  }

  async function register(input: RegisterInput): Promise<boolean> {
    try {
      await authResource.register(input)

      // Odśwież sesję
      await session.fetch()

      const { clearProfile } = useProfile()
      clearProfile()

      toast.add({
        title: 'Sukces',
        description: 'Konto zostało utworzone',
        color: 'success'
      })

      await router.push('/dashboard')
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Nie udało się utworzyć konta'
      toast.add({
        title: 'Błąd rejestracji',
        description: message,
        color: 'error'
      })
      return false
    }
  }

  async function logout(): Promise<void> {
    // Najpierw wyczyść sesję Studio z klienta (odpowiedź z Set-Cookie czyści ciasteczka w przeglądarce)
    try {
      await $fetch('/api/studio/logout', {
        method: 'POST',
        headers: { Accept: 'application/json' }
      })
    } catch {
      // Brak sesji Studio — ignoruj
    }

    // Wyczyść sesję aplikacji po stronie serwera
    try {
      await authResource.logout()
    } catch {
      // Ignorujemy błąd API, ponieważ i tak wyczyścimy stan lokalny
    }

    // Wyczyść lokalny stan sesji (nuxt-auth-utils)
    await session.clear()

    // Wyczyść stan profilu (useState)
    const { clearProfile } = useProfile()
    clearProfile()

    toast.add({
      title: 'Wylogowano',
      description: 'Zostałeś wylogowany',
      color: 'success'
    })

    // Pełne przeładowanie strony — resetuje useState('studio-session') w pluginie nuxt-studio, więc panel Studio znika
    await navigateTo('/auth/login', { external: true })
  }

  async function forgotPassword(input: ForgotPasswordInput): Promise<boolean> {
    try {
      await authResource.forgotPassword(input)

      toast.add({
        title: 'Email wysłany',
        description: 'Sprawdź swoją skrzynkę pocztową',
        color: 'success'
      })

      await router.push('/auth/login')
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Nie udało się wysłać emaila'
      toast.add({
        title: 'Błąd',
        description: message,
        color: 'error'
      })
      return false
    }
  }

  async function resetPassword(input: ResetPasswordInput): Promise<boolean> {
    try {
      await authResource.resetPassword(input)

      // Odśwież sesję (użytkownik jest automatycznie zalogowany po resecie)
      await session.fetch()

      toast.add({
        title: 'Hasło zresetowane',
        description: 'Twoje hasło zostało zmienione',
        color: 'success'
      })

      await router.push('/dashboard')
      return true
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Nie udało się zresetować hasła'
      toast.add({
        title: 'Błąd',
        description: message,
        color: 'error'
      })
      return false
    }
  }

  async function loginWithProvider(provider: 'github' | 'google' | string, options?: { returnTo?: string }): Promise<void> {
    const basePath = `/auth/${provider}`
    const returnTo = options?.returnTo ?? (router.currentRoute.value.query.redirect as string | undefined) ?? '/dashboard'
    const url = `${basePath}?returnTo=${encodeURIComponent(returnTo)}`

    try {
      // Otwórz OAuth w popupie – moduł sam zamknie okno po sukcesie
      session.openInPopup(url)
      // Po powrocie odśwież sesję
      await session.fetch()

      const { clearProfile } = useProfile()
      clearProfile()

      await router.push(returnTo)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Nie udało się zalogować przez dostawcę OAuth'
      toast.add({
        title: 'Błąd logowania OAuth',
        description: message,
        color: 'error'
      })
    }
  }

  return {
    user: readonly(user),
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    loginWithProvider
  }
}
