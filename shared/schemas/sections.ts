import { object, string, optional, boolean, array, picklist, literal, any } from 'valibot'
import { ImageSchema, ButtonSchema, FeatureItemSchema, PricingPlanSchema, TestimonialItemSchema } from './common'

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
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  features: optional(array(FeatureItemSchema)),
  reverse: optional(boolean()),
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
    footer: optional(string()),
    links: optional(string())
  }))
})

// Hero Section - ręcznie łączymy pola z SectionBaseSchema
export const SectionHeroSchema = object({
  type: literal('hero'),
  as: optional(any()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  headline: optional(string()),
  title: optional(string()),
  description: optional(string()),
  links: optional(array(ButtonSchema)),
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  image: optional(ImageSchema),
  reverse: optional(boolean()),
  ui: optional(object({
    root: optional(string()),
    container: optional(string()),
    wrapper: optional(string()),
    header: optional(string()),
    headline: optional(string()),
    title: optional(string()),
    description: optional(string()),
    body: optional(string()),
    footer: optional(string()),
    links: optional(string())
  }))
})

// Features Section
export const SectionFeaturesSchema = object({
  type: literal('features'),
  as: optional(any()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  description: optional(string()),
  links: array(ButtonSchema),
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  reverse: optional(boolean()),
  headline: optional(string()),
  icon: optional(string()),
  features: optional(array(FeatureItemSchema)),
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
    footer: optional(string()),
    links: optional(string())
  }))
})

// CTA Section
export const SectionCTASchema = object({
  type: literal('cta'),
  as: optional(any()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  description: optional(string()),
  reverse: optional(boolean()),
  links: array(ButtonSchema),
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  variant: optional(picklist(['outline', 'solid', 'soft', 'subtle', 'naked'] as const)),
  ui: optional(object({
    root: optional(string()),
    container: optional(string()),
    wrapper: optional(string()),
    header: optional(string()),
    title: optional(string()),
    description: optional(string()),
    body: optional(string()),
    footer: optional(string()),
    links: optional(string())
  }))
})

// Pricing Section
export const SectionPricingSchema = object({
  type: literal('pricing'),
  as: optional(any()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  description: optional(string()),
  links: optional(array(ButtonSchema)),
  plans: array(PricingPlanSchema),
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  reverse: optional(boolean()),
  headline: optional(string()),
  icon: optional(string()),
  items: optional(array(FeatureItemSchema)),
  ui: optional(object({
    root: optional(string()),
    container: optional(string()),
    wrapper: optional(string()),
    header: optional(string()),
    headline: optional(string()),
    title: optional(string()),
    description: optional(string()),
    body: optional(string()),
    footer: optional(string()),
    links: optional(string())
  }))
})

// FAQ Item Schema
export const FAQItemSchema = object({
  question: string(),
  answer: string(),
  icon: optional(string())
})

// FAQ Section
export const SectionFAQSchema = object({
  type: literal('faq'),
  as: optional(any()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  headline: optional(string()),
  title: optional(string()),
  description: optional(string()),
  items: array(FAQItemSchema),
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  reverse: optional(boolean()),
  multiple: optional(boolean()),

  ui: optional(object({
    root: optional(string()),
    container: optional(string()),
    wrapper: optional(string()),
    header: optional(string()),
    headline: optional(string()),
    title: optional(string()),
    description: optional(string()),
    body: optional(string()),
    items: optional(string())
  }))
})

// Testimonials Section
export const SectionTestimonialsSchema = object({
  type: literal('testimonials'),
  as: optional(any()),
  id: optional(string()),
  ref: optional(string()),
  enabled: optional(boolean()),
  headline: optional(string()),
  title: optional(string()),
  description: optional(string()),
  orientation: optional(picklist(['horizontal', 'vertical'] as const)),
  reverse: optional(boolean()),
  items: array(TestimonialItemSchema),
  layout: optional(picklist(['grid', 'carousel'] as const)),
  ui: optional(object({
    root: optional(string()),
    container: optional(string()),
    wrapper: optional(string()),
    header: optional(string()),
    headline: optional(string()),
    title: optional(string()),
    description: optional(string()),
    body: optional(string()),
    items: optional(string()),
    item: optional(string())
  }))
})
