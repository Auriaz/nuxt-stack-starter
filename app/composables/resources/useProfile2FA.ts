import { useApiClient } from '~/composables/resources/useApiClient'

export interface TwoFactorStatus {
  enabled: boolean
  recovery_codes_count: number
}

export interface TwoFactorSetup {
  secret: string
  qr_code_url: string
  message: string
}

export interface TwoFactorVerify {
  message: string
  recovery_codes: string[]
}

// TODO Cała funkcjonalność 2FA jest w tej composable, ale nie ma typów dla response z backendu , dodać typy i poprawić kod
export function useProfile2FA() {
  const toast = useToast()

  const status = ref<TwoFactorStatus | null>(null)
  const isLoading = ref(false)
  const errors = ref<Record<string, string>>({})

  /**
   * Pobierz status 2FA
  */
  const fetchStatus = async (): Promise<TwoFactorStatus | null> => {
    try {
      isLoading.value = true
      errors.value = {}

      // const headers: Record<string, string> = {
      //   'Accept': 'application/json',
      //   'Content-Type': 'application/json',
      // }

      const apiClient = useApiClient()
      const response = await apiClient.request<TwoFactorStatus>('/profile/2fa')

      status.value = response
      return response
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się pobrać statusu 2FA' }
      // eslint-disable-next-line no-console
      console.error('Failed to fetch 2FA status:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Konfiguruj 2FA (Authenticator App)
   */
  const setupAuthenticator = async (): Promise<TwoFactorSetup | null> => {
    try {
      isLoading.value = true
      errors.value = {}

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      const apiClient = useApiClient()
      const response = await apiClient.request<TwoFactorSetup>('/profile/2fa/authenticator/setup', {
        method: 'POST',
        headers
      })

      return response
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się skonfigurować 2FA' }
      // eslint-disable-next-line no-console
      console.error('Failed to setup 2FA:', error)

      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas konfiguracji 2FA',
        color: 'error'
      })

      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Weryfikuj kod 2FA i aktywuj
   */
  const verify = async (code: string): Promise<TwoFactorVerify | null> => {
    try {
      isLoading.value = true
      errors.value = {}

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      const apiClient = useApiClient()
      const response = await apiClient.request<TwoFactorVerify>('/profile/2fa/verify', {
        method: 'POST',
        headers,
        body: { code }
      })

      // Odśwież status
      await fetchStatus()

      toast.add({
        title: 'Sukces',
        description: response.message || '2FA zostało włączone pomyślnie',
        color: 'success'
      })

      return response
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się zweryfikować kodu 2FA' }
      // eslint-disable-next-line no-console
      console.error('Failed to verify 2FA:', error)

      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Nieprawidłowy kod weryfikacyjny',
        color: 'error'
      })

      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Wyłącz 2FA
   */
  const disable = async (password: string): Promise<boolean> => {
    try {
      isLoading.value = true
      errors.value = {}

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }

      const apiClient = useApiClient()
      const response = await apiClient.request<{ message: string }>('/profile/2fa', {
        method: 'DELETE',
        headers,
        body: { password }
      })

      // Odśwież status
      await fetchStatus()

      toast.add({
        title: 'Sukces',
        description: response.message || '2FA zostało wyłączone pomyślnie',
        color: 'success'
      })

      return true
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się wyłączyć 2FA' }
      // eslint-disable-next-line no-console
      console.error('Failed to disable 2FA:', error)

      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas wyłączania 2FA',
        color: 'error'
      })

      return false
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generuj nowe recovery codes
   */
  const regenerateRecoveryCodes = async (): Promise<string[] | null> => {
    try {
      isLoading.value = true
      errors.value = {}

      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
      const apiClient = useApiClient()
      const response = await apiClient.request<{ message: string, recovery_codes: string[] }>('/profile/2fa/recovery-codes', {
        method: 'POST',
        headers
      })

      // Odśwież status
      await fetchStatus()

      toast.add({
        title: 'Sukces',
        description: response.message || 'Nowe kody odzyskiwania zostały wygenerowane',
        color: 'success'
      })

      return response.recovery_codes
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się wygenerować kodów odzyskiwania' }
      // eslint-disable-next-line no-console
      console.error('Failed to regenerate recovery codes:', error)

      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas generowania kodów odzyskiwania',
        color: 'error'
      })

      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    status: readonly(status),
    isLoading: readonly(isLoading),
    errors: readonly(errors),
    fetchStatus,
    setupAuthenticator,
    verify,
    disable,
    regenerateRecoveryCodes
  }
}
