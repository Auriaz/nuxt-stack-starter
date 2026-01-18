---
name: MVP Page Builder - 7 sekcji
overview: ''
todos: []
---

# Plan MVP Page Builder - 7 sekcji

## 1. Architektura danych

### 1.1 SectionBase - wspólny schemat

**Lokalizacja**: `shared/schemas/sections.ts` (nowy plik)

**Struktura SectionBase:**

```typescript
export const SectionBaseSchema = object({
  type: picklist([
    'hero',
    'social-proof',
    'features',
    'process',
    'portfolio',
    'faq',
    'cta',
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
  spacing: optional(picklist(['sm', 'md', 'lg'] as const)), // default: 'md'
  background: optional(
    object({
      type: picklist(['none', 'gradient', 'image'] as const),
      gradient: optional(string()), // CSS gradient
      image: optional(ImageSchema),
      overlay: optional(boolean()), // Dla image background
    })
  ),
  seo: optional(
    object({
      anchor: optional(string()), // Label dla anchor link
      noindex: optional(boolean()),
    })
  ),
  schema: optional(
    object({
      enabled: optional(boolean()), // default: false
      type: optional(string()), // Schema.org type (opcjonalnie)
    })
  ),
})
```

**Uzasadnienie:**

- `type` jako discriminant dla discriminated union
- `id` dla anchor links i stabilnych keys
- `enabled` dla warunkowego renderowania
- Wspólne pola layoutu (align, theme, container, spacing)
- Background jako obiekt dla elastyczności
- SEO i schema jako opcjonalne

### 1.2 Typy specyficzne per sekcja

**Każda sekcja rozszerza SectionBase + własne props:**

```typescript
// Hero Section
export const SectionHeroSchema = SectionBaseSchema.merge(
  object({
    type: literal('hero'),
    props: object({
      layout: optional(picklist(['centered', 'split', 'full-width'] as const)),
      variant: optional(picklist(['primary', 'neutral', 'gradient', 'minimal'] as const)),
      image: optional(HeroImageSchema),
      actions: optional(array(HeroActionSchema)),
      badges: optional(array(string())), // Opcjonalne badge'y
    }),
  })
)

// Social Proof Section
export const SectionSocialProofSchema = SectionBaseSchema.merge(
  object({
    type: literal('social-proof'),
    props: object({
      variant: optional(picklist(['logos', 'stats', 'testimonials'] as const)),
      logos: optional(array(ImageSchema)), // Dla variant: 'logos'
      stats: optional(
        array(
          object({
            value: string(),
            label: string(),
            icon: optional(string()),
          })
        )
      ), // Dla variant: 'stats'
      testimonials: optional(
        array(
          object({
            name: string(),
            role: optional(string()),
            content: string(),
            avatar: optional(ImageSchema),
          })
        )
      ), // Dla variant: 'testimonials'
    }),
  })
)

// Features Section (już istnieje, trzeba zrefaktoryzować)
export const SectionFeaturesSchema = SectionBaseSchema.merge(
  object({
    type: literal('features'),
    props: object({
      items: array(FeatureItemSchema),
      layout: optional(picklist(['grid', 'list'] as const)),
      columns: optional(picklist([2, 3, 4] as const)),
      variant: optional(picklist(['default', 'cards', 'minimal'] as const)),
    }),
  })
)

// Process Section
export const SectionProcessSchema = SectionBaseSchema.merge(
  object({
    type: literal('process'),
    props: object({
      steps: array(
        object({
          title: string(),
          description: optional(string()),
          icon: optional(string()),
          number: optional(number()), // Opcjonalny numer kroku
        })
      ),
      layout: optional(picklist(['vertical', 'horizontal', 'timeline'] as const)),
      variant: optional(picklist(['default', 'minimal'] as const)),
    }),
  })
)

// Portfolio Section
export const SectionPortfolioSchema = SectionBaseSchema.merge(
  object({
    type: literal('portfolio'),
    props: object({
      projects: array(
        object({
          title: string(),
          description: optional(string()),
          image: optional(ImageSchema),
          tags: optional(array(string())),
          to: optional(string()), // Link do projektu
          featured: optional(boolean()),
        })
      ),
      layout: optional(picklist(['grid', 'masonry'] as const)),
      columns: optional(picklist([2, 3, 4] as const)),
    }),
  })
)

// FAQ Section
export const SectionFAQSchema = SectionBaseSchema.merge(
  object({
    type: literal('faq'),
    props: object({
      items: array(
        object({
          question: string(),
          answer: string(),
        })
      ),
      variant: optional(picklist(['accordion', 'list'] as const)),
      defaultOpen: optional(number()), // Index pierwszego otwartego item
    }),
  })
)

// CTA Section
export const SectionCTASchema = SectionBaseSchema.merge(
  object({
    type: literal('cta'),
    props: object({
      actions: array(HeroActionSchema), // Min 1 action
      highlight: optional(string()), // Opcjonalny highlight text
      note: optional(string()), // Opcjonalna notatka pod actions
      variant: optional(picklist(['default', 'centered', 'banner'] as const)),
    }),
  })
)
```

### 1.3 Discriminated Union Type

**`shared/types/sections.ts` (nowy plik):**

```typescript
import type { InferOutput } from 'valibot'
import type {
  SectionHeroSchema,
  SectionSocialProofSchema,
  SectionFeaturesSchema,
  SectionProcessSchema,
  SectionPortfolioSchema,
  SectionFAQSchema,
  SectionCTASchema,
} from '../schemas/sections'

export type SectionHero = InferOutput<typeof SectionHeroSchema>
export type SectionSocialProof = InferOutput<typeof SectionSocialProofSchema>
export type SectionFeatures = InferOutput<typeof SectionFeaturesSchema>
export type SectionProcess = InferOutput<typeof SectionProcessSchema>
export type SectionPortfolio = InferOutput<typeof SectionPortfolioSchema>
export type SectionFAQ = InferOutput<typeof SectionFAQSchema>
export type SectionCTA = InferOutput<typeof SectionCTASchema>

export type Section =
  | SectionHero
  | SectionSocialProof
  | SectionFeatures
  | SectionProcess
  | SectionPortfolio
  | SectionFAQ
  | SectionCTA
```

## 2. Integracja z Content Layer

### 2.1 Aktualizacja PageSchema

**`shared/schemas/content.ts`:**

```typescript
import { array } from 'valibot'
import { SectionSchema } from './sections' // Union schema (do stworzenia)

export const PageSchema = object({
  title: string(),
  description: optional(string()),
  to: optional(string()),
  sections: optional(array(SectionSchema)), // Nowe pole sections[]
  // Legacy fields (opcjonalne, dla backward compatibility)
  hero: optional(HeroSectionSchema),
  features: optional(FeaturesSectionSchema),
  seo: optional(SEOSchema),
})
```

**Uzasadnienie:**

- `sections[]` jako główne pole dla page builder
- Legacy fields dla backward compatibility
- Możliwość migracji stopniowej

### 2.2 Przykład konfiguracji w content/index.md

```yaml
---
title: 'Home'
description: 'Home page'
sections:
  - type: 'hero'
    id: 'hero'
    title: 'Witamy w Nuxt Base Starter'
    subtitle: 'Profesjonalny starter'
    description: 'Solidna podkładka...'
    align: 'center'
    theme: 'light'
    spacing: 'lg'
    props:
      layout: 'split'
      variant: 'primary'
      actions:
        - label: 'Zacznij teraz'
          to: '/kontakt'
          color: 'primary'
      image:
        src: '/images/hero.jpg'
        alt: 'Hero'
        position: 'right'
    schema:
      enabled: true
      type: 'WebPage'

  - type: 'social-proof'
    id: 'social-proof'
    title: 'Zaufali nam'
    align: 'center'
    spacing: 'md'
    props:
      variant: 'logos'
      logos:
        - src: '/images/logo1.png'
          alt: 'Client 1'
        - src: '/images/logo2.png'
          alt: 'Client 2'

  - type: 'features'
    id: 'features'
    title: 'Nasze funkcje'
    description: 'Wszystko czego potrzebujesz'
    align: 'center'
    spacing: 'lg'
    props:
      items:
        - title: 'Nuxt 4'
          description: 'Najnowsza wersja'
          icon: 'i-lucide-zap'
      layout: 'grid'
      columns: 3
      variant: 'cards'

  - type: 'process'
    id: 'process'
    title: 'Jak działamy'
    align: 'center'
    spacing: 'md'
    props:
      steps:
        - title: 'Konsultacja'
          description: 'Omawiamy potrzeby'
          icon: 'i-lucide-message-circle'
          number: 1
        - title: 'Projekt'
          description: 'Tworzymy rozwiązanie'
          icon: 'i-lucide-pencil'
          number: 2
      layout: 'horizontal'

  - type: 'portfolio'
    id: 'portfolio'
    title: 'Nasze projekty'
    align: 'center'
    spacing: 'lg'
    props:
      projects:
        - title: 'Projekt 1'
          description: 'Opis projektu'
          image:
            src: '/images/project1.jpg'
            alt: 'Projekt 1'
          tags: ['Nuxt', 'Vue']
          to: '/portfolio/project-1'
          featured: true
      layout: 'grid'
      columns: 3

  - type: 'faq'
    id: 'faq'
    title: 'Często zadawane pytania'
    align: 'center'
    spacing: 'md'
    props:
      items:
        - question: 'Czym jest Nuxt?'
          answer: 'Nuxt to framework...'
      variant: 'accordion'
      defaultOpen: 0
    schema:
      enabled: true # FAQPage schema

  - type: 'cta'
    id: 'cta'
    title: 'Gotowy do rozpoczęcia?'
    description: 'Zacznij swój projekt już dziś'
    align: 'center'
    spacing: 'lg'
    theme: 'brand'
    props:
      actions:
        - label: 'Kontakt'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'
      variant: 'centered'
      highlight: 'Bezpłatna konsultacja'
seo:
  title: 'Home'
  description: 'Home page'
---
```

## 3. SectionsRenderer

### 3.1 Komponent renderera

**`app/components/sections/SectionsRenderer.vue`:**

```vue
<script setup lang="ts">
  import type { Section } from '#shared/types/sections'

  interface Props {
    sections?: Section[]
  }

  const props = defineProps<Props>()

  // Filtruj po enabled (default: true)
  const enabledSections = computed(() => {
    return (props.sections || []).filter((section) => section.enabled !== false)
  })

  // Mapa type -> komponent
  const sectionComponents = {
    hero: resolveComponent('SectionsHero'),
    'social-proof': resolveComponent('SectionsSocialProof'),
    features: resolveComponent('SectionsFeatures'),
    process: resolveComponent('SectionsProcess'),
    portfolio: resolveComponent('SectionsPortfolio'),
    faq: resolveComponent('SectionsFAQ'),
    cta: resolveComponent('SectionsCTA'),
  } as const

  // Computed dla klas kontenera
  const getContainerClasses = (section: Section) => {
    const container = section.container || 'default'
    return {
      default: 'container mx-auto px-4',
      wide: 'container mx-auto px-4 max-w-7xl',
      full: 'w-full',
    }[container]
  }

  // Computed dla klas spacing
  const getSpacingClasses = (section: Section) => {
    const spacing = section.spacing || 'md'
    return {
      sm: 'py-12',
      md: 'py-20',
      lg: 'py-32',
    }[spacing]
  }

  // Computed dla klas theme
  const getThemeClasses = (section: Section) => {
    const theme = section.theme || 'light'
    return {
      light: 'bg-background',
      dark: 'bg-neutral-900 text-white',
      brand: 'bg-primary text-primary-foreground',
    }[theme]
  }
</script>

<template>
  <div class="sections-renderer">
    <component
      v-for="section in enabledSections"
      :key="section.id || `section-${section.type}-${$index}`"
      :is="sectionComponents[section.type]"
      :section="section"
      :base="{
        id: section.id,
        title: section.title,
        subtitle: section.subtitle || section.eyebrow,
        description: section.description,
        align: section.align || 'center',
        theme: section.theme || 'light',
        container: section.container || 'default',
        spacing: section.spacing || 'md',
        background: section.background,
        seo: section.seo,
        schema: section.schema,
      }"
      :props="section.props"
      :class="[getContainerClasses(section), getSpacingClasses(section), getThemeClasses(section)]"
    />
  </div>
</template>
```

**Uzasadnienie:**

- Filtrowanie po `enabled`
- Dynamiczne renderowanie przez `component :is`
- Przekazywanie `base` i `props` osobno
- Stabilne keys przez `section.id`
- Wspólne klasy CSS z base

## 4. Komponenty sekcji

### 4.1 Struktura komponentów

Każdy komponent przyjmuje:

- `section: Section` (pełny obiekt)
- `base: SectionBase` (wspólne pola)
- `props: SectionProps` (specyficzne dla typu)

**Przykład: `SectionsHero.vue` (refaktoryzacja):**

```vue
<script setup lang="ts">
  import type { SectionHero } from '#shared/types/sections'
  import type { SectionBase } from '#shared/types/sections'

  interface Props {
    section: SectionHero
    base: SectionBase
    props: SectionHero['props']
  }

  const props = defineProps<Props>()

  // Merge base + props
  const config = computed(() => ({
    ...props.base,
    ...props.props,
    // Override z section jeśli potrzebne
    title: props.base.title || props.section.title,
    subtitle: props.base.subtitle || props.section.subtitle,
  }))
</script>

<template>
  <section :id="base.id" :class="sectionClasses">
    <!-- Render hero z config -->
  </section>
</template>
```

### 4.2 Nowe komponenty do stworzenia

1. **`SectionsSocialProof.vue`** - logos/stats/testimonials
2. **`SectionsProcess.vue`** - steps z ikonami/numery
3. **`SectionsPortfolio.vue`** - grid projektów
4. **`SectionsFAQ.vue`** - refaktoryzacja istniejącego FAQ.vue
5. **`SectionsCTA.vue`** - refaktoryzacja istniejącego CTA.vue
6. **`SectionsFeatures.vue`** - refaktoryzacja istniejącego Features.vue
7. **`SectionsHero.vue`** - już istnieje, refaktoryzacja

## 5. Schema.org Integration

### 5.1 FAQPage (obowiązkowe dla FAQ)

**W `SectionsFAQ.vue`:**

```typescript
import { defineFAQPage } from 'nuxt-schema-org/schema'

const faqSchema = computed(() => {
  if (!props.base.schema?.enabled) return null

  return defineFAQPage({
    mainEntity: props.props.items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  })
})

if (faqSchema.value) {
  useSchemaOrg([faqSchema.value])
}
```

### 5.2 WebPage/CreativeWork (opcjonalne)

**W `SectionsHero.vue` i `SectionsCTA.vue`:**

```typescript
const heroSchema = computed(() => {
  if (!props.base.schema?.enabled) return null

  const schemaType = props.base.schema.type || 'WebPage'
  return defineWebPage({
    name: props.base.title,
    description: props.base.description,
  })
})
```

## 6. Struktura plików

```
shared/
├── schemas/
│   ├── sections.ts          # NOWY: SectionBase + wszystkie sekcje
│   └── content.ts           # Zaktualizowany: PageSchema z sections[]
├── types/
│   ├── sections.ts          # NOWY: Discriminated union types
│   └── content.ts           # Zaktualizowany: Page type

app/components/sections/
├── SectionsRenderer.vue     # NOWY: Główny renderer
├── Hero/
│   └── SectionsHero.vue    # Refaktoryzacja
├── SocialProof/
│   └── SectionsSocialProof.vue  # NOWY
├── Features/
│   └── SectionsFeatures.vue     # Refaktoryzacja
├── Process/
│   └── SectionsProcess.vue      # NOWY
├── Portfolio/
│   └── SectionsPortfolio.vue    # NOWY
├── FAQ/
│   └── SectionsFAQ.vue          # Refaktoryzacja
└── CTA/
    └── SectionsCTA.vue          # Refaktoryzacja
```

## 7. Migracja istniejących danych

### 7.1 Strategia migracji

**Dla backward compatibility:**

- Jeśli `sections[]` istnieje → użyj sections
- Jeśli `hero`/`features` istnieją → konwertuj do sections[]
- Helper function: `convertLegacyToSections(page)`

**Przykład helpera:**

```typescript
// shared/utils/sections.ts
export function convertLegacyToSections(page: Page): Section[] {
  const sections: Section[] = []

  if (page.hero) {
    sections.push({
      type: 'hero',
      id: 'hero',
      ...page.hero,
      props: {
        layout: page.hero.layout,
        variant: page.hero.variant,
        image: page.hero.image,
        actions: page.hero.actions || [],
      },
    })
  }

  if (page.features) {
    sections.push({
      type: 'features',
      id: 'features',
      title: page.features.title,
      description: page.features.description,
      props: {
        items: page.features.items,
        ...page.features.options,
      },
    })
  }

  return sections
}
```

## 8. Dokumentacja

### 8.1 Jak dodać nową sekcję typu "pricing"

**Kroki:**

1. **Dodaj schemat w `shared/schemas/sections.ts`:**

```typescript
export const SectionPricingSchema = SectionBaseSchema.merge(
  object({
    type: literal('pricing'),
    props: object({
      plans: array(
        object({
          name: string(),
          price: string(),
          period: optional(string()),
          features: array(string()),
          action: HeroActionSchema,
        })
      ),
      layout: optional(picklist(['grid', 'table'] as const)),
    }),
  })
)
```

2. **Dodaj typ w `shared/types/sections.ts`:**

```typescript
export type SectionPricing = InferOutput<typeof SectionPricingSchema>
export type Section = ... | SectionPricing
```

3. **Stwórz komponent `SectionsPricing.vue`:**

```vue
<script setup lang="ts">
  import type { SectionPricing } from '#shared/types/sections'

  interface Props {
    section: SectionPricing
    base: SectionBase
    props: SectionPricing['props']
  }

  // Implementacja...
</script>
```

4. **Zarejestruj w SectionsRenderer:**

```typescript
const sectionComponents = {
  // ...
  pricing: resolveComponent('SectionsPricing'),
}
```

5. **Użyj w content:**

```yaml
sections:
  - type: 'pricing'
    id: 'pricing'
    title: 'Cennik'
    props:
      plans: [...]
```

## 9. Deliverables

### 9.1 Pliki do utworzenia

1. `shared/schemas/sections.ts` - wszystkie schematy sekcji
2. `shared/types/sections.ts` - discriminated union types
3. `app/components/sections/SectionsRenderer.vue` - główny renderer
4. `app/components/sections/SocialProof/SectionsSocialProof.vue` - nowy
5. `app/components/sections/Process/SectionsProcess.vue` - nowy
6. `app/components/sections/Portfolio/SectionsPortfolio.vue` - nowy
7. `shared/utils/sections.ts` - helper functions (migracja, etc.)

### 9.2 Pliki do refaktoryzacji

1. `shared/schemas/content.ts` - dodanie sections[] do PageSchema
2. `shared/types/content.ts` - aktualizacja Page type
3. `app/components/sections/Hero/SectionsHero.vue` - refaktoryzacja
4. `app/components/sections/Features/Features.vue` → `SectionsFeatures.vue`

5
