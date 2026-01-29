import type { InferOutput } from 'valibot'
import type {
  LoginInputSchema,
  RegisterInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  AuthOutputSchema,
  VerifyEmailInputSchema,
  ResendVerificationInputSchema
} from '../schemas/auth'
import type { PermissionKey } from '../permissions'

export type LoginInput = InferOutput<typeof LoginInputSchema>
export type RegisterInput = InferOutput<typeof RegisterInputSchema>
export type ForgotPasswordInput = InferOutput<typeof ForgotPasswordInputSchema>
export type ResetPasswordInput = InferOutput<typeof ResetPasswordInputSchema>
export type AuthOutput = InferOutput<typeof AuthOutputSchema>

export type VerifyEmailInput = InferOutput<typeof VerifyEmailInputSchema>
export type ResendVerificationInput = InferOutput<typeof ResendVerificationInputSchema>

export interface ResetPasswordOutput {
  ok: true
  user: {
    id: number
    username: string
    email: string
    role: string
    permissions: PermissionKey[]
  }
}

export interface UserDTO {
  id: number
  email?: string | null
  name?: string | null
  username?: string | null
  avatarUrl?: string | null
  role: string
  permissions: PermissionKey[]
}

export interface RoleDTO {
  id: number
  name: string
  description?: string | null
  permissions: PermissionKey[]
}

export interface PermissionDTO {
  key: PermissionKey
  label?: string | null
  group?: string | null
}
