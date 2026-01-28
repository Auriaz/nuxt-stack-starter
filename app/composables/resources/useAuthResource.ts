import type { AuthOutput, LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from '#shared/types/auth'
import { useApiClient } from './useApiClient'

/**
 * Resource composable dla operacji autoryzacji
 *
 * Jedyny sposób, w jaki UI komunikuje się z API auth.
 * Adapter między API a UI.
 *
 * @example
 * ```ts
 * const { login, register, getMe, logout, forgotPassword, resetPassword } = useAuthResource()
 * const result = await login({ email: 'user@example.com', password: 'password' })
 * ```
 */
export function useAuthResource() {
  const apiClient = useApiClient()

  async function login(input: LoginInput): Promise<AuthOutput> {
    const response = await apiClient.request<{ data: AuthOutput } | AuthOutput>('/api/auth/login', {
      method: 'POST',
      body: input
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: AuthOutput }).data
    }
    return response as AuthOutput
  }

  async function register(input: RegisterInput): Promise<AuthOutput> {
    const response = await apiClient.request<{ data: AuthOutput } | AuthOutput>('/api/auth/register', {
      method: 'POST',
      body: input
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: AuthOutput }).data
    }
    return response as AuthOutput
  }

  async function getMe(): Promise<AuthOutput['user']> {
    const response = await apiClient.request<{ data: { user: AuthOutput['user'] } } | { user: AuthOutput['user'] }>('/api/auth/me')
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { user: AuthOutput['user'] } }).data.user
    }
    return (response as { user: AuthOutput['user'] }).user
  }

  async function forgotPassword(input: ForgotPasswordInput): Promise<{ success: boolean }> {
    const response = await apiClient.request<{ data: { success: boolean } } | { success: boolean }>('/api/auth/forgot-password', {
      method: 'POST',
      body: input
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { success: boolean } }).data
    }
    return response as { success: boolean }
  }

  async function resetPassword(input: ResetPasswordInput): Promise<AuthOutput> {
    const response = await apiClient.request<{ data: AuthOutput } | AuthOutput>('/api/auth/reset-password', {
      method: 'POST',
      body: input
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: AuthOutput }).data
    }
    return response as AuthOutput
  }

  return {
    login,
    register,
    getMe,
    forgotPassword,
    resetPassword
  }
}
