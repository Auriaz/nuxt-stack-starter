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
  email: string
  password: string
  token: string
}

export interface AuthOutput {
  user: {
    id: number
    username: string
    email: string
  }
}
