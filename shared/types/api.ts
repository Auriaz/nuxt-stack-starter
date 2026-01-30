import type { InferOutput } from 'valibot'
import type {
  CreateUserInputSchema,
  UserOutputSchema,
  UsersOutputSchema,
  ContactFormInputSchema,
  ContactFormOutputSchema,
  HealthOutputSchema
} from '../schemas/api'

export type CreateUserInput = InferOutput<typeof CreateUserInputSchema>
export type UserOutput = InferOutput<typeof UserOutputSchema>
export type UsersOutput = InferOutput<typeof UsersOutputSchema>
export type ContactFormInput = InferOutput<typeof ContactFormInputSchema>
export type ContactFormOutput = InferOutput<typeof ContactFormOutputSchema>
export type HealthOutput = InferOutput<typeof HealthOutputSchema>

/**
 * Wspólny format błędu API (zgodny z useApiClient i server)
 */
export interface ApiErrorDTO {
  code: string
  message: string
  status?: number
  issues?: unknown[]
  requestId?: string
}

/**
 * Odpowiedź sukcesu API: { data, meta? }
 */
export interface ApiSuccessResponse<T> {
  data: T
  meta?: Record<string, unknown>
}

/**
 * Odpowiedź błędu API: { error }
 */
export interface ApiErrorResponse {
  error: ApiErrorDTO
}
