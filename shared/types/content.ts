import type { InferOutput } from 'valibot'
import type {
  BlogPostSchema,
  FeaturesSectionSchema,
  FeaturesOptionsSchema,
  HeroSchemaSchema,
  HeroSectionSchema,
  PageSchema,
  PortfolioProjectSchema,
  PortfolioProjectLinkSchema
} from '../schemas/content'
import type { HeroActionSchema, HeroImageSchema, FeatureItemSchema } from '../schemas/sections'
import type { Section } from './sections'

export type BlogPost = InferOutput<typeof BlogPostSchema>

// Typ dla wyników queryCollection('blog')
export type BlogPostEntry = BlogPost & {
  _path: string
  _id: string
  _type: string
}

// Features types
export type FeatureItem = InferOutput<typeof FeatureItemSchema>
export type FeaturesSection = InferOutput<typeof FeaturesSectionSchema>
export type FeaturesOptions = InferOutput<typeof FeaturesOptionsSchema>

// Hero types
export type HeroAction = InferOutput<typeof HeroActionSchema>
export type HeroImage = InferOutput<typeof HeroImageSchema>
export type HeroSchema = InferOutput<typeof HeroSchemaSchema>
export type HeroSection = InferOutput<typeof HeroSectionSchema>

// Portfolio types
export type PortfolioProjectLink = InferOutput<typeof PortfolioProjectLinkSchema>
export type PortfolioProject = InferOutput<typeof PortfolioProjectSchema>

export type Page = InferOutput<typeof PageSchema> & {
  sections?: Section[] // Dodanie sections do typu Page
}

// Typ dla wyników queryCollection('pages')
export type PageEntry = Page & {
  _path: string
  _id: string
  _type: string
}

// Typ dla wyników queryCollection('portfolio')
export type PortfolioProjectEntry = PortfolioProject & {
  _path: string
  _id: string
  _type: string
}
