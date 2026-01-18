import { object, string, date, array, optional, picklist, boolean, any } from 'valibot'
import { ImageSchema, SEOSchema } from './common'
import { AuthorSchema } from './user'
import { HeroActionSchema, HeroImageSchema, FeatureItemSchema } from './sections'

export const BlogPostSchema = object({
  title: string(),
  description: optional(string()),
  date: date(),
  image: ImageSchema,
  authors: optional(array(AuthorSchema)),
  tags: optional(array(string())),
  seo: optional(SEOSchema),
  anchors: optional(array(object({
    label: string(),
    to: string(),
    target: optional(string())
  })))
})

// FeatureItemSchema został przeniesiony do sections.ts aby uniknąć cyklicznego importu

// FeaturesOptionsSchema
export const FeaturesOptionsSchema = object({
  layout: optional(picklist(['grid', 'list'] as const)),
  columns: optional(picklist([2, 3, 4] as const)),
  variant: optional(picklist(['default', 'cards', 'minimal'] as const)),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'neutral'] as const))
})

// FeaturesSectionSchema
export const FeaturesSectionSchema = object({
  title: optional(string()),
  description: optional(string()),
  items: array(FeatureItemSchema),
  options: optional(FeaturesOptionsSchema)
})

// HeroActionSchema i HeroImageSchema zostały przeniesione do sections.ts aby uniknąć cyklicznego importu

// HeroSchemaSchema (dla Schema.org)
export const HeroSchemaSchema = object({
  type: optional(picklist(['WebPage', 'CreativeWork', 'Product', 'Service'] as const)),
  enabled: optional(boolean())
})

// HeroSectionSchema
export const HeroSectionSchema = object({
  layout: optional(picklist(['centered', 'split', 'full-width'] as const)),
  variant: optional(picklist(['primary', 'neutral', 'gradient', 'minimal'] as const)),
  eyebrow: optional(string()),
  title: string(),
  subtitle: optional(string()),
  description: optional(string()),
  image: optional(HeroImageSchema),
  actions: optional(array(HeroActionSchema)),
  schema: optional(HeroSchemaSchema)
})

// PortfolioProjectLinkSchema
export const PortfolioProjectLinkSchema = object({
  type: picklist(['live', 'github', 'behance', 'dribbble', 'figma', 'other'] as const),
  label: string(),
  url: string(),
  target: optional(picklist(['_self', '_blank'] as const))
})

// PortfolioProjectSchema
export const PortfolioProjectSchema = object({
  title: string(),
  slug: optional(string()),
  description: string(),
  excerpt: optional(string()),
  coverImage: ImageSchema,
  tags: optional(array(string())),
  technologies: optional(array(string())),
  year: optional(string()),
  role: optional(string()),
  client: optional(string()),
  featured: optional(boolean()),
  status: optional(picklist(['draft', 'published', 'archived'] as const)),
  publishedAt: optional(date()),
  seo: optional(SEOSchema),
  gallery: optional(array(ImageSchema)),
  links: optional(array(PortfolioProjectLinkSchema)),
  category: optional(string())
})

// PageSchema
export const PageSchema = object({
  title: string(),
  description: optional(string()),
  to: optional(string()),
  sections: optional(array(any())), // Nowe pole sections[] dla page builder
  // Legacy fields (opcjonalne, dla backward compatibility)
  hero: optional(HeroSectionSchema),
  features: optional(FeaturesSectionSchema),
  seo: optional(SEOSchema)
})
