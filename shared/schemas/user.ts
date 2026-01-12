import { object, string, optional } from 'valibot'
import { ImageSchema } from './common'

export const AuthorSchema = object({
  name: string(),
  avatar: ImageSchema,
  description: optional(string()),
  email: optional(string()),
  to: optional(string()),
  target: optional(string())
})

export const UserSchema = object({
  name: string(),
  email: string(),
  avatar: ImageSchema,
  description: optional(string()),
  to: optional(string()),
  target: optional(string())
})
