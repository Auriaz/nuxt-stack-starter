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
  }
}
