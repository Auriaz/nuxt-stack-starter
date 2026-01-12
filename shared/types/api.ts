import type { InferInput, InferOutput } from 'valibot'
import type { ContactFormSchema, CreatePostRequestSchema, PostResponseSchema } from '../schemas/api'

export type ContactFormRequest = InferInput<typeof ContactFormSchema>
export type CreatePostRequest = InferInput<typeof CreatePostRequestSchema>
export type PostResponse = InferOutput<typeof PostResponseSchema>
