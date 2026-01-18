import { object, string, optional, boolean, array, picklist, number, literal, variant } from 'valibot'
import { ImageSchema } from './common'

// FeatureItemSchema - przeniesiony z content.ts aby uniknąć cyklicznego importu
export const FeatureItemSchema = object({
  title: string(),
  description: optional(string()),
  icon: optional(string()), // Nazwa ikony (np. "i-lucide-zap")
  link: optional(object({
    label: string(),
    href: string(),
    target: optional(picklist(['_self', '_blank'] as const))
  })),
  badge: optional(string())
})

// HeroActionSchema - przeniesiony z content.ts aby uniknąć cyklicznego importu
export const HeroActionSchema = object({
  label: string(),
  to: string(),
  color: optional(picklist(['primary', 'neutral', 'success', 'warning', 'error'] as const)),
  variant: optional(picklist(['solid', 'outline', 'ghost', 'soft'] as const)),
  size: optional(picklist(['xs', 'sm', 'md', 'lg', 'xl'] as const)),
  target: optional(picklist(['_self', '_blank'] as const)),
  icon: optional(string()) // Nazwa ikony (np. "i-lucide-arrow-right")
})

// HeroImageSchema - przeniesiony z content.ts aby uniknąć cyklicznego importu
export const HeroImageSchema = object({
  src: string(),
  alt: optional(string()),
  position: optional(picklist(['left', 'right', 'center', 'background'] as const)), // Dla layout split
  objectFit: optional(picklist(['cover', 'contain', 'fill'] as const))
})

// SectionBaseSchema - wspólny schemat dla wszystkich sekcji
export const SectionBaseSchema = object({
  type: picklist([
    'hero',
    'social-proof',
    'features',
    'process',
    'portfolio',
    'faq',
    'cta',
    'pricing',
    'contact-details',
    'contact-form',
    'map'
  ] as const),
  id: optional(string()), // Anchor ID (np. "hero-section")
  enabled: optional(boolean()), // default: true
  title: optional(string()),
  subtitle: optional(string()), // Alias dla eyebrow
  eyebrow: optional(string()), // Alias dla subtitle
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)), // default: 'center'
  theme: optional(picklist(['light', 'dark', 'brand'] as const)), // default: 'light'
  container: optional(picklist(['default', 'wide', 'full'] as const)), // default: 'default'
  spacing: optional(picklist(['sm', 'md', 'lg', 'none'] as const)), // default: 'md'
  reverse: optional(boolean()), // default: false
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()), // CSS gradient
      image: optional(ImageSchema),
      overlay: optional(boolean()) // Dla image background
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()), // Label dla anchor link
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()), // default: false
      type: optional(string()) // Schema.org type (opcjonalnie)
    })
  )
})

// Hero Section - ręcznie łączymy pola z SectionBaseSchema
export const SectionHeroSchema = object({
  type: literal('hero'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    layout: optional(picklist(['centered', 'split', 'full-width'] as const)),
    variant: optional(picklist(['primary', 'neutral', 'gradient', 'minimal'] as const)),
    image: optional(HeroImageSchema),
    actions: optional(array(HeroActionSchema)),
    badges: optional(array(string()))
  })
})

// Social Proof Section
export const SectionSocialProofSchema = object({
  type: literal('social-proof'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    variant: optional(picklist(['logos', 'stats', 'testimonials'] as const)),
    logos: optional(array(ImageSchema)),
    stats: optional(
      array(
        object({
          value: string(),
          label: string(),
          icon: optional(string())
        })
      )
    ),
    testimonials: optional(
      array(
        object({
          name: string(),
          role: optional(string()),
          content: string(),
          avatar: optional(ImageSchema)
        })
      )
    )
  })
})

// Features Section
export const SectionFeaturesSchema = object({
  type: literal('features'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg', 'none'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    items: array(FeatureItemSchema),
    layout: optional(picklist(['grid', 'list'] as const)),
    columns: optional(picklist([2, 3, 4] as const)),
    variant: optional(picklist(['default', 'cards', 'minimal'] as const))
  })
})

// Process Section
export const SectionProcessSchema = object({
  type: literal('process'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    steps: array(
      object({
        title: string(),
        description: optional(string()),
        icon: optional(string()),
        number: optional(number())
      })
    ),
    layout: optional(picklist(['vertical', 'horizontal', 'timeline'] as const)),
    variant: optional(picklist(['default', 'minimal'] as const))
  })
})

// Portfolio Section
export const SectionPortfolioSchema = object({
  type: literal('portfolio'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    limit: optional(number()),
    showFeaturedOnly: optional(boolean()),
    filterByTags: optional(array(string())),
    filterByTechnologies: optional(array(string())),
    filterByYear: optional(string()),
    sortBy: optional(picklist(['newest', 'oldest', 'featured'] as const)),
    layout: optional(picklist(['grid', 'masonry', 'carousel'] as const)),
    columns: optional(picklist([2, 3, 4] as const))
  })
})

// FAQ Section
export const SectionFAQSchema = object({
  type: literal('faq'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    items: array(
      object({
        question: string(),
        answer: string()
      })
    ),
    variant: optional(picklist(['accordion', 'list'] as const)),
    defaultOpen: optional(number())
  })
})

// CTA Section
export const SectionCTASchema = object({
  type: literal('cta'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg', 'none'] as const)),
  reverse: optional(boolean()),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    links: array(HeroActionSchema),
    highlight: optional(string()),
    note: optional(string()),
    variant: optional(picklist(['outline', 'solid', 'soft', 'subtle', 'naked'] as const))
  })
})

// Pricing Section
export const SectionPricingSchema = object({
  type: literal('pricing'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    plans: array(
      object({
        name: string(),
        price: string(),
        period: optional(string()),
        description: optional(string()),
        features: array(string()),
        action: HeroActionSchema,
        popular: optional(boolean())
      })
    ),
    layout: optional(picklist(['grid', 'table'] as const))
  })
})

// Contact Details Section
export const SectionContactDetailsSchema = object({
  type: literal('contact-details'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    variant: optional(picklist(['cards', 'list'] as const)),
    items: array(
      object({
        label: string(),
        value: string(),
        href: optional(string()),
        icon: optional(string()),
        note: optional(string())
      })
    )
  })
})

// Contact Form Section
export const SectionContactFormSchema = object({
  type: literal('contact-form'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    endpoint: optional(string()),
    method: optional(picklist(['POST'] as const)),
    fields: array(
      object({
        name: string(),
        label: string(),
        type: optional(picklist(['text', 'email', 'tel', 'textarea'] as const)),
        required: optional(boolean()),
        placeholder: optional(string()),
        icon: optional(string())
      })
    ),
    consent: optional(
      object({
        label: string(),
        required: optional(boolean())
      })
    ),
    successMessage: optional(string()),
    errorMessage: optional(string()),
    spamProtection: optional(
      object({
        type: optional(picklist(['honeypot', 'turnstile'] as const))
      })
    )
  })
})

// Map Section
export const SectionMapSchema = object({
  type: literal('map'),
  id: optional(string()),
  enabled: optional(boolean()),
  title: optional(string()),
  subtitle: optional(string()),
  eyebrow: optional(string()),
  description: optional(string()),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'dark', 'brand'] as const)),
  container: optional(picklist(['default', 'wide', 'full'] as const)),
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)),
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()),
      image: optional(ImageSchema),
      overlay: optional(boolean())
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()),
      noindex: optional(boolean())
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()),
      type: optional(string())
    })
  ),
  props: object({
    type: picklist(['embed', 'link'] as const),
    embedUrl: optional(string()),
    linkUrl: optional(string()),
    addressText: optional(string()),
    note: optional(string())
  })
})

// Discriminated union schema dla wszystkich sekcji używając variant
// variant jest lepszy niż union dla discriminated unions z polem 'type'
export const SectionSchema = variant('type', [
  SectionHeroSchema,
  SectionSocialProofSchema,
  SectionFeaturesSchema,
  SectionProcessSchema,
  SectionPortfolioSchema,
  SectionFAQSchema,
  SectionCTASchema,
  SectionPricingSchema,
  SectionContactDetailsSchema,
  SectionContactFormSchema,
  SectionMapSchema
])
