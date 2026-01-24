import { object, string, optional, boolean, array, picklist, literal, any } from 'valibot'
import { ImageSchema, ButtonSchema, FeatureItemSchema, PricingPlanSchema, TestimonialItemSchema, FAQItemSchema } from './common'
import { PortfolioProjectSchema } from './content'

// SectionBaseSchema
export const SectionBaseSchema = object({
  type: picklist(['section', 'hero', 'features', 'cta', 'pricing', 'faq', 'testimonials', 'social-proof', 'process', 'portfolio'] as const),
  as: optional(any()),
  icon: optional(string()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  headline: optional(string()),
  title: optional(string()),
  description: optional(string()),
  links: optional(array(ButtonSchema)),
  features: optional(array(FeatureItemSchema)),
  reverse: optional(boolean()),
  spacing: optional(picklist(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand', 'neutral'] as const)),
  background: optional(picklist(['none', 'subtle', 'muted', 'surface', 'gradient', 'image'] as const)),
  container: optional(picklist(['default', 'narrow', 'wide', 'full'] as const)),
  align: optional(picklist(['none', 'left', 'center'] as const)),
  schema: optional(any()),
  ui: optional(object({
    root: optional(string()),
    container: optional(string()),
    wrapper: optional(string()),
    header: optional(string()),
    leading: optional(string()),
    leadingIcon: optional(string()),
    headline: optional(string()),
    title: optional(string()),
    description: optional(string()),
    body: optional(string()),
    items: optional(string()),
    item: optional(string()),
    footer: optional(string()),
    links: optional(string())
  }))
})

// Hero Section – dziedziczy z SectionBaseSchema
export const SectionHeroSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('hero'),
  image: optional(ImageSchema),
  orientation: optional(picklist(['horizontal', 'vertical'] as const))
})

// Features Section – dziedziczy z SectionBaseSchema
export const SectionFeaturesSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('features'),
  // W tej sekcji linki są wymagane
  links: array(ButtonSchema)
})

// CTA Section – dziedziczy z SectionBaseSchema
export const SectionCTASchema = object({
  ...SectionBaseSchema.entries,
  type: literal('cta'),
  // CTA wymaga linków
  links: array(ButtonSchema),
  variant: optional(picklist(['outline', 'solid', 'soft', 'subtle', 'naked'] as const))
})

// Pricing Section – dziedziczy z SectionBaseSchema
export const SectionPricingSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('pricing'),
  plans: array(PricingPlanSchema),
  items: optional(array(FeatureItemSchema))
})

// FAQ Section – dziedziczy z SectionBaseSchema
export const SectionFAQSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('faq'),
  items: array(FAQItemSchema),
  multiple: optional(boolean())
})

// Testimonials Section – dziedziczy z SectionBaseSchema
export const SectionTestimonialsSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('testimonials'),
  items: array(TestimonialItemSchema),
  layout: optional(picklist(['grid', 'carousel'] as const))
})

// Portfolio Section – dziedziczy z SectionBaseSchema
export const SectionPortfolioSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('portfolio'),
  options: object({
    projects: array(PortfolioProjectSchema),
    layout: optional(picklist(['grid', 'carousel'] as const))
  })
})
