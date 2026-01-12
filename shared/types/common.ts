import type { InferOutput } from 'valibot'
import type { ImageSchema, SEOSchema } from '../schemas/common'

export type Image = InferOutput<typeof ImageSchema>
export type SEO = InferOutput<typeof SEOSchema>
