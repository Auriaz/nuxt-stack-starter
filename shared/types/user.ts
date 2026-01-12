import type { InferOutput } from 'valibot'
import type { AuthorSchema, UserSchema } from '../schemas/user'

export type Author = InferOutput<typeof AuthorSchema>
export type User = InferOutput<typeof UserSchema>
export type UserType = User // Alias dla kompatybilności wstecznej
