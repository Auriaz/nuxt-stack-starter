---
name: Uniwersalny komponent Hero data-driven
overview: Zaprojektowanie i wdrożenie uniwersalnego komponentu sekcji Hero, który będzie konfigurowany przez Content Layer, obsługiwał różne layouty (centered, split, full-width), integrował Schema.org, używał komponentów Nuxt UI i był gotowy do rozbudowy bez refaktoryzacji API.
todos:
  - id: hero-schemas-types
    content: Dodać schematy Valibot (HeroActionSchema, HeroImageSchema, HeroSchemaSchema, HeroSectionSchema) w shared/schemas/content.ts oraz typy TypeScript w shared/types/content.ts
    status: completed
  - id: hero-page-schema
    content: Zaktualizować PageSchema w shared/schemas/content.ts, aby zawierał pole hero jako opcjonalne
    status: completed
    dependencies:
      - hero-schemas-types
  - id: hero-component
    content: Zrefaktoryzować app/components/sections/Hero/SectionsHero.vue na uniwersalny komponent z props typu HeroSection, obsługą layoutów (centered, split, full-width) i wariantów
    status: completed
    dependencies:
      - hero-schemas-types
  - id: hero-schema-org
    content: Dodać integrację Schema.org (WebPage, CreativeWork) w SectionsHero.vue z użyciem useSchemaOrg
    status: completed
    dependencies:
      - hero-component
  - id: hero-content-data
    content: Zaktualizować content/index.md z pełną konfiguracją hero zgodną z nowym schematem
    status: completed
    dependencies:
      - hero-page-schema
  - id: hero-testing
    content: Przetestować wszystkie layouty, warianty i opcje, sprawdzić Schema.org w devtools, zweryfikować responsywność
    status: completed
    dependencies:
      - hero-schema-org
      - hero-content-data
---

# Plan wdrożenia uniwersalnego komponentu Hero

## 1. Struktura danych i schematy

### 1.1 Model danych Hero w Content

**Lokalizacja**: `content/*.md` (frontmatter)

**Struktura:**

```yaml
hero:
  layout: 'split' # centered | split | full-width
  variant: 'primary' # primary | neutral | gradient | minimal
  eyebrow: 'Nowość' # Opcjonalny badge/eyebrow text
  title: 'Tworzymy nowoczesne aplikacje webowe'
  subtitle: 'Skalowalne rozwiązania oparte o Nuxt i Laravel' # Opcjonalny podtytuł
  description: 'Od pomysłu po wdrożenie – kompleksowe wsparcie technologiczne.'
  image:
    src: '/images/hero.webp'
    alt: 'Nowoczesna infrastruktura webowa'
  actions:
    - label: 'Kontakt'
      to: '/kontakt'
      color: 'primary'
      variant: 'solid'
      size: 'lg'
    - label: 'Portfolio'
      to: '/portfolio'
      variant: 'outline'
      size: 'lg'
  schema:
    type: 'WebPage' # WebPage | CreativeWork | Product | Service
    enabled: true
```

### 1.2 Schematy Valibot

**`shared/schemas/content.ts`:**

```typescript
// HeroActionSchema
export const HeroActionSchema = object({
  label: string(),
  to: string(),
  color: optional(picklist(['primary', 'neutral', 'success', 'warning', 'error'] as const)),
  variant: optional(picklist(['solid', 'outline', 'ghost', 'soft'] as const)),
  size: optional(picklist(['xs', 'sm', 'md', 'lg', 'xl'] as const)),
  target: optional(picklist(['_self', '_blank'] as const)),
  icon: optional(string()), // Nazwa ikony (np. "i-lucide-arrow-right")
})

// HeroImageSchema (rozszerza ImageSchema)
export const HeroImageSchema = object({
  src: string(),
  alt: optional(string()),
  position: optional(picklist(['left', 'right', 'center', 'background'] as const)), // Dla layout split
  objectFit: optional(picklist(['cover', 'contain', 'fill'] as const)),
})

// HeroSchemaSchema (dla Schema.org)
export const HeroSchemaSchema = object({
  type: optional(picklist(['WebPage', 'CreativeWork', 'Product', 'Service'] as const)),
  enabled: optional(boolean()),
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
  schema: optional(HeroSchemaSchema),
})

// Rozszerzenie PageSchema
export const PageSchema = object({
  title: string(),
  description: optional(string()),
  to: optional(string()),
  hero: optional(HeroSectionSchema), // Dodanie hero
  features: optional(FeaturesSectionSchema),
  seo: optional(SEOSchema),
})
```

### 1.3 Typy TypeScript

**`shared/types/content.ts`:**

```typescript
import type {
  HeroActionSchema,
  HeroImageSchema,
  HeroSchemaSchema,
  HeroSectionSchema,
  PageSchema,
} from '../schemas/content'

export type HeroAction = InferOutput<typeof HeroActionSchema>
export type HeroImage = InferOutput<typeof HeroImageSchema>
export type HeroSchema = InferOutput<typeof HeroSchemaSchema>
export type HeroSection = InferOutput<typeof HeroSectionSchema>
export type Page = InferOutput<typeof PageSchema> // Zaktualizowany
```

## 2. Architektura komponentu

### 2.1 Struktura plików

```
app/components/sections/Hero/
├── SectionsHero.vue          # Główny komponent (prezentacyjny)
├── HeroLayoutCentered.vue    # Layout centered (opcjonalny, jeśli potrzebny)
├── HeroLayoutSplit.vue       # Layout split (opcjonalny)
└── HeroLayoutFullWidth.vue   # Layout full-width (opcjonalny)
```

**Uzasadnienie:**

- Główny komponent jako orchestrator
- Osobne komponenty layoutów dla separacji odpowiedzialności (opcjonalnie, można też użyć slots/computed)
- Łatwiejsze testowanie i utrzymanie

### 2.2 Props i interfejs

**`SectionsHero.vue`:**

```typescript
interface Props {
  hero?: HeroSection
  // Opcjonalne override (dla elastyczności)
  layout?: 'centered' | 'split' | 'full-width'
  variant?: 'primary' | 'neutral' | 'gradient' | 'minimal'
}
```

**Zasady:**

- Komponent jest czysto prezentacyjny
- Dane wyłącznie przez props
- Brak logiki routingu/fetchowania
- Props mają priorytet nad `hero.options`

### 2.3 Mapowanie layoutów

**Composable `useHeroLayout()` (opcjonalnie):**

```typescript
// app/composables/useHeroLayout.ts
export function useHeroLayout(hero: HeroSection) {
  const layout = computed(() => hero?.layout || 'centered')
  const variant = computed(() => hero?.variant || 'primary')

  const layoutClasses = computed(() => {
    // Mapowanie layout → klasy CSS
  })

  return { layout, variant, layoutClasses }
}
```

**Alternatywa:** Wszystko w komponencie jako computed properties (prostsze, mniej abstrakcji)

## 3. Implementacja layoutów

### 3.1 Layout: `centered`

**Charakterystyka:**

- Tekst wyśrodkowany
- Obraz opcjonalnie powyżej/poniżej tekstu
- Actions wyśrodkowane
- Kontener z max-width

**Komponenty Nuxt UI:**

- `UContainer` - kontener
- `UPageHero` - jeśli pasuje do wariantu
- `UButton` - dla actions
- `UBadge` - dla eyebrow
- `NuxtImg` - dla obrazu (optymalizacja)

### 3.2 Layout: `split`

**Charakterystyka:**

- Grid 2 kolumny (text | image)
- Responsywny: mobile stack, desktop side-by-side
- Image position: left/right (domyślnie right)

**Komponenty Nuxt UI:**

- `UContainer` + grid Tailwind
- `UCard` - opcjonalnie dla image container
- `UButton` - dla actions
- `UBadge` - dla eyebrow

### 3.3 Layout: `full-width`

**Charakterystyka:**

- Pełna szerokość viewport
- Image jako background (opcjonalnie)
- Overlay dla tekstu
- Kontener dla contentu

**Komponenty Nuxt UI:**

- Własny wrapper z background-image
- `UContainer` - dla contentu
- `UButton` - dla actions
- `UBadge` - dla eyebrow

### 3.4 Warianty stylu

**`variant: 'primary'`:**

- Kolor primary dla akcentów
- Standardowe tło

**`variant: 'neutral'`:**

- Neutralne kolory
- Subtelne tło

**`variant: 'gradient'`:**

- Gradient background
- Wizualnie bardziej wyrazisty

**`variant: 'minimal'`:**

- Minimalistyczny
- Mniej wizualnych elementów

## 4. Schema.org Integration

### 4.1 Wspierane typy

- **WebPage** - dla stron informacyjnych
- **CreativeWork** - dla treści kreatywnych
- **Product** - dla stron produktowych (przyszłość)
- **Service** - dla stron usługowych (przyszłość)

### 4.2 Implementacja

**W `SectionsHero.vue`:**

```typescript
import { defineWebPage, defineCreativeWork } from 'nuxt-schema-org/schema'

// Computed dla schema
const heroSchema = computed(() => {
  if (!props.hero?.schema?.enabled) return null

  const schemaType = props.hero.schema.type || 'WebPage'
  const baseData = {
    name: props.hero.title,
    description: props.hero.description,
    image: props.hero.image?.src,
  }

  switch (schemaType) {
    case 'WebPage':
      return defineWebPage(baseData)
    case 'CreativeWork':
      return defineCreativeWork(baseData)
    // Product, Service - przyszłość
    default:
      return defineWebPage(baseData)
  }
})

// Użycie w template
useSchemaOrg([heroSchema.value].filter(Boolean))
```

**Bezpieczeństwo SSR:**

- Warunkowe renderowanie tylko gdy `hero.schema.enabled === true`
- Fallback do `null` jeśli brak danych
- Type guards dla bezpieczeństwa typów

## 5. Komponenty Nuxt UI

### 5.1 Wybrane komponenty

**Główna sekcja:**

- `UContainer` - kontener z paddingiem
- `UPageHero` - jeśli layout centered (sprawdzić czy pasuje)
- Własny wrapper dla split/full-width

**Elementy:**

- `UBadge` - dla eyebrow
- `UHeading` / `<h1>` - dla title
- `<p>` - dla description/subtitle
- `UButton` - dla actions (array)
- `NuxtImg` - dla obrazu (optymalizacja)

### 5.2 Uzasadnienie

- **UContainer**: Spójny padding i max-width
- **UButton**: Elastyczne props (color, variant, size, icon)
- **UBadge**: Gotowy komponent dla eyebrow
- **NuxtImg**: Automatyczna optymalizacja obrazów

## 6. Skalowalność i przyszła rozbudowa

### 6.1 Przygotowanie pod rozbudowę

**Pola zarezerwowane w schemacie (opcjonalne, na przyszłość):**

```typescript
// W HeroSectionSchema (można dodać później)
video: optional(object({
  src: string(),
  poster: optional(string()),
  autoplay: optional(boolean())
})),
badge: optional(object({
  label: string(),
  color: optional(string()),
  variant: optional(string())
})),
animation: optional(picklist(['fade', 'slide', 'none'] as const))
```

**Strategia:**

- Opcjonalne pola w schemacie
- Warunkowe renderowanie w komponencie
- Backward compatible (stare dane działają)

### 6.2 Tryby użycia

**Marketingowy:**

- Layout: split lub full-width
- Wariant: gradient lub primary
- Wiele actions
- Image prominent

**Blogowy:**

- Layout: centered
- Wariant: minimal lub neutral
- Mniej actions
- Image opcjonalny

**Produktowy:**

- Layout: split
- Wariant: primary
- Schema: Product (przyszłość)
- Image + actions

### 6.3 Logika renderowania

**Computed slots pattern:**

```typescript
const heroContent = computed(() => {
  const layout = props.hero?.layout || props.layout || 'centered'

  return {
    layout,
    hasImage: !!props.hero?.image,
    hasActions: !!props.hero?.actions?.length,
    hasEyebrow: !!props.hero?.eyebrow,
  }
})
```

**Warstwa mapująca config → UI:**

- Computed properties dla klas CSS
- Conditional rendering na podstawie layout/variant
- Fallback values dla brakujących pól

## 7. Integracja z Content Layer

### 7.1 Użycie w markdown

**Obecna składnia (użytkownik już używa):**

```markdown
::SectionsHero{:title='hero.title' :description='hero.description' ...}
```

**Rekomendacja:**

```markdown
::SectionsHero{:hero='hero'}
```

**Uzasadnienie:**

- Jeden prop zamiast wielu
- Łatwiejsze utrzymanie
- Spójne z Features komponentem

### 7.2 Walidacja

- Valibot schema waliduje frontmatter
- TypeScript typuje komponent
- Runtime fallback dla brakujących pól

## 8. Deliverables

### 8.1 Pliki do utworzenia/modyfikacji

1. **`shared/schemas/content.ts`** - dodanie schematów Hero
2. **`shared/types/content.ts`** - dodanie typów Hero
3. **`content.config.ts`** - PageSchema już zawiera hero (sprawdzić)
4. **`app/components/sections/Hero/SectionsHero.vue`** - refaktoryzacja
5. **`content/index.md`** - aktualizacja struktury hero (użytkownik już zaczął)

### 8.2 Przykładowe dane

**`content/index.md` (zaktualizowane):**

```yaml
hero:
  layout: 'split'
  variant: 'primary'
  eyebrow: 'Nowość'
  title: 'Witamy w Nuxt Base Starter'
  subtitle: 'Profesjonalny starter dla nowoczesnych aplikacji'
  description: 'Solidna podkładka pod strony internetowe oparta o Nuxt 4, gotowa do wielokrotnego użycia i łatwa do aktualizowania.'
  image:
    src: '/images/hero.jpg'
    alt: 'Nuxt Base Starter'
    position: 'right'
  actions:
    - label: 'Zacznij teraz'
      to: '/kontakt'
      color: 'primary'
      variant: 'solid'
      size: 'lg'
    - label: 'Dowiedz się więcej'
      to: '/oferta'
      variant: 'outline'
      size: 'lg'
  schema:
    type: 'WebPage'
    enabled: true
```

### 8.3 Obsłużone funkcjonalności

**W zakresie:**

- ✅ Layout: `centered`, `split`, `full-width`
- ✅ Variant: `primary`, `neutral`, `gradient`, `minimal`
- ✅ Opcjonalne: `eyebrow`, `subtitle`, `image`, `actions[]`
- ✅ Schema.org: `WebPage`, `CreativeWork` (Product/Service - przyszłość)
- ✅ Responsywność: mobile-first
- ✅ Optymalizacja obrazów: NuxtImg

**Poza zakresem (możliwe rozszerzenia):**

- ❌ Video background (można dodać później)
- ❌ Animacje motion (można dodać później)
- ❌ Product/Service schema (można dodać później)
- ❌ Custom kolory per action (można dodać później)

## 9. Ryzyka i pułapki

### 9.1 Kompatybilność z UPageHero

**Problem:** UPageHero może mieć ograniczone opcje konfiguracji

**Rozwiązanie:**

- Sprawdzić dokumentację UPageHero
- Jeśli nie pasuje do wszystkich layoutów, użyć własnego wrappera
- Zachować spójność wizualną z Nuxt UI

### 9.2 Schema.org w SSR

**Problem:** Schema może powodować błędy SSR jeśli dane są undefined

**Rozwiązanie:**

- Warunkowe renderowanie: `if (hero?.schema?.enabled)`
- Type guards przed użyciem `useSchemaOrg`
- Fallback do `null`

### 9.3 Image optimization

**Problem:** Obrazy mogą być duże, wpływ na performance

**Rozwiązanie:**

- Użycie `NuxtImg` z lazy loading
- Responsive images (srcset)
- WebP format (jeśli możliwe)

### 9.4 Backward compatibility

**Problem:** Stare dane mogą nie mieć nowych pól

**Rozwiązanie:**

- Wszystkie nowe pola opcjonalne
- Sensowne domyślne wartości
- Graceful degradation

## 10. Kolejność implementacji

1. **Schematy i typy** (`shared/schemas/content.ts`, `shared/types/content.ts`)
2. **Aktualizacja PageSchema** (sprawdzić czy już zawiera hero)
3. **Refaktoryzacja SectionsHero.vue** (główny komponent)
4. **Implementacja layoutów** (centered, split, full-width)
5. **Integracja Schema.org** (useSchemaOrg)
6. **Aktualizacja content/index.md** (przykładowe dane)
7. **Testowanie i dokumentacja**

## 11. Uwagi dodatkowe

- **ContentRenderer**: Użytkownik używa `::SectionsHero` w markdown - komponent musi być dostępny jako globalny
- **Responsywność**: Wszystkie layouty muszą być mobile-first
- **Accessibility**: Proper ARIA labels, semantic HTML
- **Performance**: Lazy loading dla obrazów, optymalizacja Schema.org
- **i18n**: Rozważyć wsparcie dla wielojęzyczności (jeśli potrzebne)
