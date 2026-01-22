import type { InferOutput } from 'valibot'
import type { ImageSchema, SEOSchema, LinkSchema, TestimonialItemSchema, FeatureItemSchema, PricingPlanSchema } from '../schemas/common'

export type Image = InferOutput<typeof ImageSchema>
export type SEO = InferOutput<typeof SEOSchema>
export type Link = InferOutput<typeof LinkSchema>
export type FeatureItem = InferOutput<typeof FeatureItemSchema>
export type PricingPlan = InferOutput<typeof PricingPlanSchema>
export type TestimonialItem = InferOutput<typeof TestimonialItemSchema>
