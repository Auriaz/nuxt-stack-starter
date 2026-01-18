import type { InferOutput } from 'valibot'
import type {
  SectionHeroSchema,
  SectionSocialProofSchema,
  SectionFeaturesSchema,
  SectionProcessSchema,
  SectionPortfolioSchema,
  SectionFAQSchema,
  SectionCTASchema,
  SectionPricingSchema,
  SectionBaseSchema
} from '../schemas/sections'

export type SectionBase = InferOutput<typeof SectionBaseSchema>

export type SectionHero = InferOutput<typeof SectionHeroSchema>
export type SectionSocialProof = InferOutput<typeof SectionSocialProofSchema>
export type SectionFeatures = InferOutput<typeof SectionFeaturesSchema>
export type SectionProcess = InferOutput<typeof SectionProcessSchema>
export type SectionPortfolio = InferOutput<typeof SectionPortfolioSchema>
export type SectionFAQ = InferOutput<typeof SectionFAQSchema>
export type SectionCTA = InferOutput<typeof SectionCTASchema>
export type SectionPricing = InferOutput<typeof SectionPricingSchema>

// Discriminated union type
export type Section
  = | SectionHero
    | SectionSocialProof
    | SectionFeatures
    | SectionProcess
    | SectionPortfolio
    | SectionFAQ
    | SectionCTA
    | SectionPricing
