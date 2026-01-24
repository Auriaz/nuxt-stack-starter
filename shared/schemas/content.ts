import { object, string, date, array, optional, picklist, boolean, union } from 'valibot'
import { ImageSchema, SEOSchema } from './common'
import { AuthorSchema } from './user'
import { SectionHeroSchema, SectionCTASchema, SectionBaseSchema, SectionFeaturesSchema, SectionPricingSchema, SectionFAQSchema, SectionTestimonialsSchema } from './sections'

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
  sections: optional(
    array(
      union([
        SectionHeroSchema,
        SectionFeaturesSchema,
        SectionPricingSchema,
        SectionCTASchema,
        SectionFAQSchema,
        SectionTestimonialsSchema,
        SectionBaseSchema
      ])
    )
  ),
  seo: optional(SEOSchema)
})
