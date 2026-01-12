import { object, string, date, array, optional } from 'valibot'
import { ImageSchema, SEOSchema } from './common'
import { AuthorSchema } from './user'

export const BlogPostSchema = object({
  title: string(),
  description: optional(string()),
  date: date(),
  image: ImageSchema,
  authors: optional(array(AuthorSchema)),
  tags: optional(array(string())),
  seo: optional(SEOSchema),
})
