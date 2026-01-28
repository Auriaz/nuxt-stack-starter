// useUserSession jest auto-importowane przez nuxt-auth-utils
import { useAuthResource } from './resources/useAuthResource'
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
    // session.clear() czyści sesję lokalnie i usuwa cookie z sesją
    // Nie ma potrzeby wywoływania endpointu API, ponieważ sesja jest przechowywana w cookie
    await session.clear()

    toast.add({
      title: 'Wylogowano',
      description: 'Zostałeś wylogowany',
      color: 'success'
    })

    await router.push('/auth/login')
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

  return {
    user: readonly(user),
    isLoggedIn,
    isLoading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
  }
}
