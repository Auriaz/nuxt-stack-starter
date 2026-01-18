---
name: Wdrożenie sekcji Features data-driven
overview: Zaplanowanie i wdrożenie sekcji Features jako data-driven komponentu, który pobiera dane z Nuxt Content, jest typowany przez Valibot schemas, używa komponentów Nuxt UI i jest gotowy do edycji w Nuxt Studio oraz łatwy do zastąpienia własnym komponentem.
todos:
  - id: schemas-types
    content: Dodać schematy Valibot (FeatureItemSchema, FeaturesOptionsSchema, FeaturesSectionSchema, PageSchema) w shared/schemas/content.ts oraz typy TypeScript w shared/types/content.ts
    status: completed
  - id: content-config
    content: Zintegrować PageSchema z kolekcją pages w content.config.ts
    status: completed
    dependencies:
      - schemas-types
  - id: content-data
    content: Dodać przykładowe dane features w content/index.md (i opcjonalnie w about.md, offers.md, contact.md)
    status: completed
    dependencies:
      - schemas-types
  - id: refactor-features
    content: Refaktoryzować app/components/sections/Features/Features.vue na data-driven komponent z props typu FeaturesSection
    status: completed
    dependencies:
      - schemas-types
      - content-config
  - id: feature-card
    content: Utworzyć opcjonalny komponent app/components/sections/Features/FeatureCard.vue dla pojedynczej karty feature
    status: completed
    dependencies:
      - refactor-features
  - id: integrate-pages
    content: Zintegrować Features komponent w app/pages/index.vue (i innych stronach) z przekazaniem page.features
    status: completed
    dependencies:
      - refactor-features
      - content-data
  - id: test-document
    content: Przetestować wszystkie warianty layoutu i opcje, oraz udokumentować użycie
    status: completed
    dependencies:
      - integrate-pages
---

# Plan wdrożenia sekcji Features (data-driven)

## 1. Struktura plików

### 1.1 Dane w Content

- **Lokalizacja**: `content/index.md`, `content/about.md`, `content/offers.md`, `content/contact.md`
- **Struktura**: Pole `features` jako obiekt w frontmatter (nie w `sections` array)
- **Uzasadnienie**: - Separacja od `sections` (które są bardziej ogólne) - Płaska struktura ułatwia edycję w Nuxt Studio - Łatwiejsze mapowanie w komponencie

### 1.2 Komponenty

- **Główny komponent**: `app/components/sections/Features/Features.vue` (refaktoryzacja istniejącego)
- **Komponent karty**: `app/components/sections/Features/FeatureCard.vue` (nowy, opcjonalny)
- **Uzasadnienie**: - Zachowanie istniejącej struktury katalogów - FeatureCard jako osobny komponent dla reużywalności i testowania

### 1.3 Schematy i typy

- **Schematy**: `shared/schemas/content.ts` (rozszerzenie)
- **Typy**: `shared/types/content.ts` (rozszerzenie)
- **Uzasadnienie**: - Spójność z istniejącą strukturą (BlogPostSchema) - Centralizacja definicji content

### 1.4 Schema dla kolekcji pages

- **Lokalizacja**: `content.config.ts`
- **Akcja**: Dodanie `PageSchema` z `features` jako opcjonalnym polem

## 2. Model danych Features

### 2.1 Struktura w frontmatter

```yaml
features:
  title: "Nasze funkcje"
  description: "Wszystko czego potrzebujesz"
  items:
  - title: "Nuxt 4"
      description: "Najnowsza wersja"
      icon: "i-lucide-zap"
      link:
        label: "Dowiedz się więcej"
        href: "/blog/nuxt-4"
      badge: "Nowość"
  options:
    layout: "grid"  # grid | list
    columns: 3      # 2 | 3 | 4
    variant: "cards" # default | cards | minimal
    align: "center" # left | center
    theme: "light"  # light | neutral (opcjonalnie)
```

### 2.2 Uzasadnienie struktury

**Pola wymagane:**

- `features.items[].title` - minimum do wyświetlenia

**Pola opcjonalne:**

- `features.title`, `features.description` - header sekcji (może być pusty)
- `features.items[].description` - tekst pod tytułem
- `features.items[].icon` - ikona (kompatybilna z Nuxt UI Icon)
- `features.items[].link` - CTA w karcie
- `features.items[].badge` - etykieta (np. "Nowość", "Popularne")
- `features.options.*` - konfiguracja layoutu

**Dlaczego `options` jako obiekt:**

- Grupowanie powiązanych ustawień
- Łatwiejsze rozszerzanie w przyszłości
- Czytelność w Nuxt Studio

## 3. Komponenty Nuxt UI

### 3.1 Wybrane komponenty

**Główna sekcja:**

- `UContainer` - kontener z paddingiem (już używany)
- `UPageSection` - jeśli istnieje w Nuxt UI (do sprawdzenia)
- Alternatywa: własny wrapper `<section>` z klasami Tailwind

**Karty features:**

- `UCard` - podstawowa karta (variant: "naked" lub "outline")
- `UIcon` - ikony (już używany)
- `UBadge` - etykiety (jeśli `badge` jest ustawione)
- `UButton` - link jako przycisk (jeśli `link` jest ustawione)

**Header sekcji:**

- `UHeading` - jeśli dostępny w Nuxt UI
- Alternatywa: `<h2>` z klasami Tailwind

### 3.2 Uzasadnienie

- **UCard**: Elastyczny, wspiera różne warianty, zgodny z design system
- **UIcon**: Już używany w projekcie, kompatybilny z Iconify
- **UBadge**: Gotowy komponent dla etykiet
- **UButton**: Spójny styl linków/CTA

### 3.3 Warianty layoutu

**`layout: "grid"`** (domyślny):

- Grid responsywny: `grid-cols-1 md:grid-cols-2 lg:grid-cols-{columns}`
- Używa `UCard` z wariantem

**`layout: "list"`**:

- Lista pionowa z ikonami po lewej
- Mniej wizualne, bardziej tekstowe

**`variant: "cards"`** (domyślny):

- Pełne karty z cieniem i hover

**`variant: "minimal"`**:

- Minimalistyczny, bez ramek, tylko ikona + tekst

\*\*`variant: "default"`:

- Podstawowy styl (border, padding)

## 4. Walidacja i typowanie

### 4.1 Schematy Valibot

**`shared/schemas/content.ts`:**

```typescript
// FeatureItemSchema
export const FeatureItemSchema = object({
  title: string(),
  description: optional(string()),
  icon: optional(string()), // Nazwa ikony (np. "i-lucide-zap")
  link: optional(
    object({
      label: string(),
      href: string(),
      target: optional(picklist(['_self', '_blank'] as const)),
    })
  ),
  badge: optional(string()),
})

// FeaturesOptionsSchema
export const FeaturesOptionsSchema = object({
  layout: optional(picklist(['grid', 'list'] as const)),
  columns: optional(picklist([2, 3, 4] as const)),
  variant: optional(picklist(['default', 'cards', 'minimal'] as const)),
  align: optional(picklist(['left', 'center'] as const)),
  theme: optional(picklist(['light', 'neutral'] as const)),
})

// FeaturesSectionSchema
export const FeaturesSectionSchema = object({
  title: optional(string()),
  description: optional(string()),
  items: array(FeatureItemSchema),
  options: optional(FeaturesOptionsSchema),
})

// PageSchema (rozszerzenie)
export const PageSchema = object({
  title: string(),
  description: optional(string()),
  to: optional(string()),
  features: optional(FeaturesSectionSchema),
  seo: optional(SEOSchema),
})
```

### 4.2 Typy TypeScript

**`shared/types/content.ts`:**

```typescript
import type { InferOutput } from 'valibot'
import type {
  FeatureItemSchema,
  FeaturesSectionSchema,
  FeaturesOptionsSchema,
  PageSchema,
} from '../schemas/content'

export type FeatureItem = InferOutput<typeof FeatureItemSchema>
export type FeaturesSection = InferOutput<typeof FeaturesSectionSchema>
export type FeaturesOptions = InferOutput<typeof FeaturesOptionsSchema>
export type Page = InferOutput<typeof PageSchema>

// Typ dla wyników queryCollection('pages')
export type PageEntry = Page & {
  _path: string
  _id: string
  _type: string
}
```

### 4.3 Integracja z content.config.ts

```typescript
import { PageSchema } from './shared/schemas/content'

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: PageSchema, // Dodanie schematu
    }),
    // ...
  },
})
```

## 5. Implementacja komponentu

### 5.1 Features.vue (refaktoryzacja)

**Props:**

```typescript
interface Props {
  features?: FeaturesSection
  // Opcjonalnie: override options
  layout?: 'grid' | 'list'
  variant?: 'default' | 'cards' | 'minimal'
}
```

**Logika:**

- Pobiera `features` jako prop (z `page.value.features`)
- Fallback: jeśli brak `features` lub `features.items` jest pusty → nie renderuje sekcji
- Merge `features.options` z props (props mają priorytet)
- Computed dla klas CSS na podstawie `layout`, `variant`, `columns`, `align`

**Template:**

- Warunkowy render: `v-if="features?.items?.length"`
- Header: `v-if="features.title || features.description"`
- Grid/List: dynamiczne klasy na podstawie `layout`
- FeatureCard: v-for przez `features.items`

### 5.2 FeatureCard.vue (nowy, opcjonalny)

**Props:**

```typescript
interface Props {
  feature: FeatureItem
  variant?: 'default' | 'cards' | 'minimal'
  showIcon?: boolean
  showBadge?: boolean
}
```

**Uzasadnienie:**

- Separacja odpowiedzialności
- Łatwiejsze testowanie
- Możliwość użycia w innych miejscach

### 5.3 Integracja w index.vue

```vue
<script setup>
  const { path } = useRoute()
  const { data: page } = await useAsyncData(
    'home',
    () => queryCollection < PageEntry > 'pages'.path(path).first()
  )
</script>

<template>
  <SectionsFeatures :features="page?.features" />
</template>
```

## 6. Przygotowanie pod Nuxt Studio

### 6.1 Konwencje nazw pól

- **CamelCase** dla pól (np. `features.title`, `features.items`)
- **Krótkie, opisowe nazwy** (np. `icon`, `badge`, `link`)
- **Zagnieżdżone obiekty** tylko gdy konieczne (np. `link: { label, href }`)

### 6.2 Domyślne wartości

- `layout: "grid"` (najczęściej używany)
- `columns: 3` (równowaga wizualna)
- `variant: "cards"` (najbardziej wizualny)
- `align: "center"` (centrowanie header)

### 6.3 Czytelność w Studio

- **Płaska struktura** - unikamy zbyt głębokich zagnieżdżeń
- **Opcjonalne pola** - nie wymuszamy wszystkich pól
- **Przykładowe wartości** - w komentarzach YAML (opcjonalnie)

## 7. Extensibility contract

### 7.1 Stabilny kontrakt danych

**Pola, które NIE powinny się zmieniać:**

- `features.items[].title` (wymagane)
- `features.items` (array)
- `features.options.layout` (wartości: 'grid' | 'list')
- `features.options.variant` (wartości: 'default' | 'cards' | 'minimal')

**Pola, które mogą się rozszerzać:**

- `features.items[].*` - nowe opcjonalne pola (np. `image`, `color`)
- `features.options.*` - nowe opcje layoutu (np. `spacing`, `animation`)

### 7.2 Zastąpienie komponentu

**Strategia adaptera:**

1. **Obecny komponent**: `SectionsFeatures.vue` używa `FeaturesSection` type
2. **Custom komponent**: Użytkownik tworzy `SectionsFeaturesCustom.vue` z tym samym prop type
3. **Switch w nuxt.config.ts** (opcjonalnie):

   ```typescript
   // app.config.ts lub composable
   export const useFeaturesComponent = () => {
     const config = useAppConfig()
     return config.features?.component || 'SectionsFeatures'
   }
   ```

4. **Lub bezpośrednia podmiana** w `index.vue`:
   ```vue
   <SectionsFeaturesCustom :features="page?.features" />
   ```

**Uzasadnienie:**

- Typ `FeaturesSection` pozostaje stabilny
- Komponent może być dowolnie zmieniony
- Brak zależności od konkretnej implementacji

## 8. Deliverables

### 8.1 Pliki do utworzenia/modyfikacji

1. **`content/index.md`** - dodanie `features` w frontmatter
2. **`shared/schemas/content.ts`** - dodanie schematów Features
3. **`shared/types/content.ts`** - dodanie typów Features
4. **`content.config.ts`** - dodanie `PageSchema` do kolekcji `pages`
5. **`app/components/sections/Features/Features.vue`** - refaktoryzacja na data-driven
6. **`app/components/sections/Features/FeatureCard.vue`** - nowy komponent (opcjonalny)
7. **`app/pages/index.vue`** - przekazanie `page.features` do komponentu

### 8.2 Przykładowe dane

**`content/index.md` (fragment):**

```yaml
features:
  title: "Nasze funkcje"
  description: "Wszystko czego potrzebujesz do rozpoczęcia projektu"
  items:
  - title: "Nuxt 4"
      description: "Najnowsza wersja Nuxt z pełnym wsparciem dla TypeScript i Vue 3."
      icon: "i-lucide-zap"
      badge: "Nowość"
  - title: "Nuxt UI"
      description: "Gotowe komponenty UI zgodne z najlepszymi praktykami design system."
      icon: "i-lucide-palette"
  - title: "SEO Ready"
      description: "Kompletna konfiguracja SEO z meta tags, sitemap i OpenGraph."
      icon: "i-lucide-search"
  options:
    layout: "grid"
    columns: 3
    variant: "cards"
    align: "center"
```

### 8.3 Obsłużone warianty

**W zakresie:**

- ✅ `layout: "grid"` z `columns: 2|3|4`
- ✅ `layout: "list"` (lista pionowa)
- ✅ `variant: "cards"` (pełne karty)
- ✅ `variant: "default"` (podstawowy)
- ✅ `variant: "minimal"` (minimalistyczny)
- ✅ `align: "left" | "center"` (wyrównanie header)
- ✅ Opcjonalne: `icon`, `badge`, `link` w items

**Poza zakresem (możliwe rozszerzenia):**

- ❌ Animacje/transitions (można dodać później)
- ❌ Custom kolory per item (można dodać później)
- ❌ Filtrowanie/sortowanie items (poza zakresem)
- ❌ Paginacja items (poza zakresem)

## 9. Ryzyka i pułapki

### 9.1 Nazwy ikon

**Problem:** Ikony mogą nie istnieć w Iconify

**Rozwiązanie:**

- Walidacja w dev mode (opcjonalnie)
- Fallback: brak ikony jeśli nie znaleziono
- Dokumentacja: używać tylko ikon z Iconify (np. `i-lucide-*`)

### 9.2 Brak items

**Problem:** `features.items` jest pusty lub undefined

**Rozwiązanie:**

- Warunkowy render: `v-if="features?.items?.length"`
- Lub wyświetlenie komunikatu (opcjonalnie)

### 9.3 Nadmierna konfiguracja

**Problem:** Zbyt wiele opcji utrudnia użycie

**Rozwiązanie:**

- Sensowne domyślne wartości
- Dokumentacja minimalnej konfiguracji
- Stopniowe rozszerzanie (nie wszystko na raz)

### 9.4 Kompatybilność z Nuxt Studio

**Problem:** Studio może nie obsługiwać zagnieżdżonych obiektów

**Rozwiązanie:**

- Testowanie w Studio po implementacji
- Ewentualne spłaszczenie struktury (np. `features.item1Title` zamiast `features.items[0].title`) - NIE rekomendowane, lepiej użyć płaskiej struktury `items[]`

### 9.5 Type safety w runtime

**Problem:** Valibot waliduje tylko w dev mode

**Rozwiązanie:**

- Type guards w komponencie (opcjonalnie)
- Fallback values dla brakujących pól
- Dokumentacja wymaganych pól

## 10. Kolejność implementacji

1. **Schematy i typy** (`shared/schemas/content.ts`, `shared/types/content.ts`)
2. **Schema w content.config.ts** (`PageSchema` dla kolekcji `pages`)
3. **Dane w content/index.md** (przykładowe `features`)
4. **Refaktoryzacja Features.vue** (data-driven)
5. **FeatureCard.vue** (opcjonalny, jeśli potrzebny)
6. **Integracja w index.vue** (przekazanie danych)
7. **Testowanie i dokumentacja**

## 11. Uwagi dodatkowe

- **Komponenty Nuxt UI**: Sprawdzić czy `UPageSection` istnieje (jeśli nie, użyć własnego wrappera)
- **Responsywność**: Grid powinien być responsywny (mobile: 1 kolumna, tablet: 2, desktop: 3-4)
- **Accessibility**: Upewnić się, że sekcja ma odpowiednie ARIA labels
- **Performance**: Lazy loading dla ikon (jeśli dużo items)
- **i18n**: Rozważyć wsparcie dla wielojęzyczności w `features.title/description` (jeśli potrzebne)
