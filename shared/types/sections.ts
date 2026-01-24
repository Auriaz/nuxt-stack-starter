import type { InferOutput } from 'valibot'
import type {
  SectionHeroSchema,
  SectionBaseSchema,
  SectionCTASchema,
  SectionFeaturesSchema,
  SectionPricingSchema,
  SectionFAQSchema,
  SectionTestimonialsSchema,
  SectionPortfolioSchema
} from '../schemas/sections'

export type SectionBase = InferOutput<typeof SectionBaseSchema>
export type SectionCTA = InferOutput<typeof SectionCTASchema>
export type SectionHero = InferOutput<typeof SectionHeroSchema>
export type SectionFeatures = InferOutput<typeof SectionFeaturesSchema>
export type SectionPricing = InferOutput<typeof SectionPricingSchema>
export type SectionFAQ = InferOutput<typeof SectionFAQSchema>
export type SectionTestimonials = InferOutput<typeof SectionTestimonialsSchema>
export type SectionPortfolio = InferOutput<typeof SectionPortfolioSchema>
// Discriminated union type
export type Section
  = | SectionHero
    | SectionCTA
    | SectionBase
    | SectionFeatures
    | SectionPricing
    | SectionFAQ
    | SectionTestimonials
    | SectionPortfolio
