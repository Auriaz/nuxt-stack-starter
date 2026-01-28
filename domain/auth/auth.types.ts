/**
 * Typy dla autoryzacji i autentykacji
 */

export interface LoginInput {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ResetPasswordInput {
  token: string
  password: string
  passwordConfirm: string
}

export interface ResetPasswordOutput {
  ok: true
  user: {
    id: number
    username: string
    email: string
  }
}

export interface AuthOutput {
  user: {
    id: number
    username: string
    email: string
  }
}

export interface VerifyEmailInput {
  token: string
}

export interface ResendVerificationInput {
  email: string
}

export interface VerifyEmailOutput {
  verified: boolean
  user: {
    id: number
    username: string
    email: string
  }
}

/**
 * Profil zwrócony przez providera OAuth w ustandaryzowanej formie
 */
export interface OAuthProfile {
  provider: 'github' | 'google' | string
  providerAccountId: string
  email?: string
  emailVerified?: boolean
  name?: string
  avatarUrl?: string
}

/**
 * Minimalny użytkownik przechowywany w sesji
 */
export interface SessionUser {
  id: number
  role: string
  name?: string
  avatarUrl?: string
}
