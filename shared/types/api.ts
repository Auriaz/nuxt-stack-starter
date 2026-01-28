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
