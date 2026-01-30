import type { InferOutput } from 'valibot'
import type {
  ProfileOutputSchema,
  UpdateProfileInputSchema,
  UpdatePrivacyInputSchema,
  UpdatePasswordInputSchema
} from '../schemas/profile'

export type ProfileDTO = InferOutput<typeof ProfileOutputSchema>
export type UpdateProfileInput = InferOutput<typeof UpdateProfileInputSchema>
export type UpdatePrivacyInput = InferOutput<typeof UpdatePrivacyInputSchema>
export type UpdatePasswordInput = InferOutput<typeof UpdatePasswordInputSchema>
