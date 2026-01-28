import type { InferOutput } from 'valibot'
import type {
  LoginInputSchema,
  RegisterInputSchema,
  ForgotPasswordInputSchema,
  ResetPasswordInputSchema,
  AuthOutputSchema
} from '../schemas/auth'

export type LoginInput = InferOutput<typeof LoginInputSchema>
export type RegisterInput = InferOutput<typeof RegisterInputSchema>
export type ForgotPasswordInput = InferOutput<typeof ForgotPasswordInputSchema>
export type ResetPasswordInput = InferOutput<typeof ResetPasswordInputSchema>
export type AuthOutput = InferOutput<typeof AuthOutputSchema>
