import type { InferOutput } from 'valibot'
import type { BlogPostSchema } from '../schemas/content'

export type BlogPost = InferOutput<typeof BlogPostSchema>

// Typ dla wyników queryCollection('blog')
export type BlogPostEntry = BlogPost & {
  _path: string
  _id: string
  _type: string
}
