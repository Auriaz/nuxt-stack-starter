import type { InferOutput } from 'valibot'
import type {
  BlogPostSchema,
  PageSchema,
  PortfolioProjectSchema,
  PortfolioProjectLinkSchema
} from '../schemas/content'
import type { Section } from './sections'

export type BlogPost = InferOutput<typeof BlogPostSchema>

// Typ dla wyników queryCollection('blog')
export type BlogPostEntry = BlogPost & {
  _path: string
  _id: string
  _type: string
}

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
