import type {
  AuthOutput,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ResetPasswordOutput,
  VerifyEmailInput,
  ResendVerificationInput
} from '#shared/types/auth'
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

  async function register(input: RegisterInput): Promise<{ ok: true }> {
    const response = await apiClient.request<{ data: { ok: true } } | { ok: true }>('/api/auth/register', {
      method: 'POST',
      body: input
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { ok: true } }).data
    }
    return response as { ok: true }
  }

  async function getMe(): Promise<AuthOutput['user'] | null> {
    const response = await apiClient.request<{ data: { user: AuthOutput['user'] | null } } | { user: AuthOutput['user'] | null }>('/api/auth/me')
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { user: AuthOutput['user'] | null } }).data.user
    }
    return (response as { user: AuthOutput['user'] | null }).user
  }

  async function forgotPassword(input: ForgotPasswordInput): Promise<{ ok: true }> {
    const response = await apiClient.request<{ data: { ok: true } } | { ok: true }>('/api/auth/forgot-password', {
      method: 'POST',
      body: input
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { ok: true } }).data
    }
    return response as { ok: true }
  }

  async function resetPassword(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    const response = await apiClient.request<{ data: ResetPasswordOutput } | ResetPasswordOutput>('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: input.token,
        password: input.password,
        passwordConfirm: input.passwordConfirm
      }
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: ResetPasswordOutput }).data
    }
    return response as ResetPasswordOutput
  }

  async function logout(): Promise<{ ok: true }> {
    const response = await apiClient.request<{ data: { ok: true } } | { ok: true }>('/api/auth/logout', {
      method: 'POST'
    })
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { ok: true } }).data
    }
    return response as { ok: true }
  }

  async function verifyEmail(input: VerifyEmailInput): Promise<{ verified: boolean }> {
    const response = await apiClient.request<{ data: { verified: boolean } } | { verified: boolean }>(
      `/api/auth/verify-email?token=${encodeURIComponent(input.token)}`,
      {
        method: 'GET'
      }
    )

    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { verified: boolean } }).data
    }

    return response as { verified: boolean }
  }

  async function resendVerification(input: ResendVerificationInput): Promise<{ ok: true }> {
    const response = await apiClient.request<{ data: { ok: true } } | { ok: true }>('/api/auth/resend-verification', {
      method: 'POST',
      body: input
    })

    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: { ok: true } }).data
    }

    return response as { ok: true }
  }

  return {
    login,
    register,
    getMe,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification
  }
}
