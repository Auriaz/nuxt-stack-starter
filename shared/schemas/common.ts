import { object, string, optional, boolean, array, picklist, any, union, number } from 'valibot'

export const ImageSchema = object({
  src: string(),
  alt: optional(string())
})

// LinkSchema - przeniesiony z content.ts aby uniknąć cyklicznego importu
export const LinkSchema = object({
  label: string(),
  to: string(),
  color: optional(picklist(['primary', 'neutral', 'success', 'warning', 'error', 'info'] as const)),
  variant: optional(picklist(['solid', 'outline', 'ghost', 'soft'] as const)),
  size: optional(picklist(['xs', 'sm', 'md', 'lg', 'xl'] as const)),
  target: optional(picklist(['_self', '_blank'] as const)),
  icon: optional(string()) // Nazwa ikony (np. "i-lucide-arrow-right")
})

export const SEOSchema = object({
  title: optional(string()),
  description: optional(string()),
  image: optional(string()),
  noindex: optional(boolean()),
  ogType: optional(picklist(['website', 'article', 'profile'] as const)),
  publishedTime: optional(string()),
  modifiedTime: optional(string()),
  author: optional(string()),
  tags: optional(array(string()))
})

// Badge Schema dla planów cenowych
export const BadgeSchema = object({
  as: optional(any()),
  label: optional(union([string(), any()])),
  color: optional(picklist(['error', 'primary', 'secondary', 'success', 'info', 'warning', 'neutral'] as const)),
  variant: optional(picklist(['soft', 'solid', 'outline', 'subtle'] as const)),
  size: optional(picklist(['xs', 'sm', 'md', 'lg', 'xl'] as const)),
  square: optional(boolean()),
  class: optional(any()),
  ui: optional(object({
    base: optional(any()),
    label: optional(any()),
    leadingIcon: optional(any()),
    leadingAvatar: optional(any()),
    leadingAvatarSize: optional(any()),
    trailingIcon: optional(any())
  })),
  icon: optional(any()),
  avatar: optional(any()),
  leading: optional(boolean()),
  leadingIcon: optional(any()),
  trailing: optional(boolean()),
  trailingIcon: optional(any())
})

// Button Schema dla planów cenowych
export const ButtonSchema = object({
  label: optional(string()),
  color: optional(picklist(['error', 'primary', 'secondary', 'success', 'info', 'warning', 'neutral'] as const)),
  activeColor: optional(picklist(['error', 'primary', 'secondary', 'success', 'info', 'warning', 'neutral'] as const)),
  variant: optional(picklist(['soft', 'solid', 'outline', 'subtle', 'ghost', 'link'] as const)),
  activeVariant: optional(picklist(['soft', 'solid', 'outline', 'subtle', 'ghost', 'link'] as const)),
  size: optional(picklist(['xs', 'sm', 'md', 'lg', 'xl'] as const)),
  square: optional(boolean()),
  block: optional(boolean()),
  loadingAuto: optional(boolean()),
  class: optional(any()),
  ui: optional(object({
    base: optional(any()),
    label: optional(any()),
    leadingIcon: optional(any()),
    leadingAvatar: optional(any()),
    leadingAvatarSize: optional(any()),
    trailingIcon: optional(any())
  })),
  icon: optional(any()),
  avatar: optional(any()),
  leading: optional(boolean()),
  leadingIcon: optional(any()),
  trailing: optional(boolean()),
  trailingIcon: optional(any()),
  loading: optional(boolean()),
  loadingIcon: optional(any()),
  as: optional(any()),
  to: optional(string()),
  autofocus: optional(boolean()),
  disabled: optional(boolean()),
  name: optional(string()),
  type: optional(picklist(['reset', 'submit', 'button'] as const)),
  download: optional(any()),
  hreflang: optional(string()),
  media: optional(string()),
  ping: optional(string()),
  target: optional(picklist(['_blank', '_parent', '_self', '_top'] as const)),
  referrerpolicy: optional(picklist(['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url'] as const)),
  active: optional(boolean()),
  trailingSlash: optional(picklist(['remove', 'append'] as const))
})

// Pricing Plan Feature Schema
export const PricingPlanFeatureSchema = object({
  title: string(),
  icon: optional(any())
})

// Pricing Plan Schema
export const PricingPlanSchema = object({
  as: optional(any()),
  title: optional(string()),
  description: optional(string()),
  badge: optional(union([string(), BadgeSchema])),
  billingCycle: optional(string()),
  billingPeriod: optional(string()),
  price: optional(string()),
  discount: optional(string()),
  features: optional(array(union([string(), PricingPlanFeatureSchema]))),
  button: optional(ButtonSchema),
  tagline: optional(string()),
  terms: optional(string()),
  orientation: optional(picklist(['vertical', 'horizontal'] as const)),
  variant: optional(picklist(['soft', 'solid', 'outline', 'subtle'] as const)),
  highlight: optional(boolean()),
  scale: optional(boolean()),
  ui: optional(object({
    root: optional(any()),
    header: optional(any()),
    body: optional(any()),
    footer: optional(any()),
    titleWrapper: optional(any()),
    title: optional(any()),
    description: optional(any()),
    priceWrapper: optional(any()),
    price: optional(any()),
    discount: optional(any()),
    billing: optional(any()),
    billingPeriod: optional(any()),
    billingCycle: optional(any()),
    features: optional(any()),
    feature: optional(any()),
    featureIcon: optional(any()),
    featureTitle: optional(any()),
    badge: optional(any()),
    button: optional(any()),
    tagline: optional(any()),
    terms: optional(any())
  })),
  // Zachowujemy stare pola dla kompatybilności wstecznej
  name: optional(string()),
  period: optional(string()),
  action: optional(LinkSchema),
  featured: optional(boolean())
})

// FeatureItemSchema - przeniesiony z content.ts aby uniknąć cyklicznego importu
export const FeatureItemSchema = object({
  as: optional(any()),
  title: string(),
  description: optional(string()),
  icon: optional(string()), // Nazwa ikony (np. "i-lucide-zap")
  orientation: optional(picklist(['vertical', 'horizontal'] as const)),
  to: optional(string()),
  target: optional(picklist(['_self', '_blank'] as const)),
  class: optional(any()),
  ui: optional(object({
    root: optional(string()),
    wrapper: optional(string()),
    leading: optional(string()),
    leadingIcon: optional(string()),
    title: optional(string()),
    description: optional(string())
  }))
})

// Testimonial Item Schema
export const TestimonialItemSchema = object({
  quote: string(),
  author: object({
    name: string(),
    role: optional(string()),
    company: optional(string()),
    avatar: optional(string())
  }),
  rating: optional(any()),
  featured: optional(boolean()),
  ui: optional(object({
    card: optional(object({
      root: optional(string()),
      header: optional(string()),
      body: optional(string()),
      footer: optional(string())
    })),
    rating: optional(object({
      root: optional(string()),
      icon: optional(string()),
      value: optional(number())
    })),
    author: optional(object({
      root: optional(string()),
      name: optional(string()),
      role: optional(string()),
      company: optional(string()),
      avatar: optional(string())
    }))
  }))
})
