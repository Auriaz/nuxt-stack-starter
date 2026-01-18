---
name: Unifikacja PortfolioCard i SectionsPortfolio z Single Source of Truth
overview: Projektowanie i implementacja wspólnej warstwy danych dla Portfolio, zapewniającej Single Source of Truth z content/portfolio, czysty kontrakt danych dla PortfolioCard i unifikację użycia w SectionsPortfolio oraz stronie /portfolio.
todos:
  - id: create-portfolio-types
    content: Utworzenie shared/types/portfolio.ts z PortfolioCardProps i PortfolioContentOptions
    status: pending
  - id: create-composable
    content: Utworzenie app/composables/usePortfolioContent.ts z composable i funkcją mapującą
    status: pending
    dependencies:
      - create-portfolio-types
  - id: refactor-portfolio-card
    content: Refaktoryzacja PortfolioCard.vue - zmiana props na PortfolioCardProps
    status: pending
    dependencies:
      - create-portfolio-types
  - id: update-section-schema
    content: Aktualizacja SectionPortfolioSchema w shared/schemas/sections.ts - usunięcie projects, dodanie opcji konfiguracji
    status: pending
  - id: refactor-sections-portfolio
    content: Refaktoryzacja SectionsPortfolio.vue - użycie composable i PortfolioCard
    status: pending
    dependencies:
      - create-composable
      - refactor-portfolio-card
      - update-section-schema
  - id: refactor-portfolio-grid
    content: Refaktoryzacja PortfolioGrid.vue - zmiana typów na PortfolioCardProps[]
    status: pending
    dependencies:
      - create-portfolio-types
      - refactor-portfolio-card
  - id: refactor-portfolio-page
    content: Refaktoryzacja app/pages/portfolio/index.vue - użycie composable
    status: pending
    dependencies:
      - create-composable
      - refactor-portfolio-grid
  - id: update-documentation
    content: Aktualizacja dokumentacji docs/PORTFOLIO.md z informacjami o sekcji Portfolio
    status: pending
    dependencies:
      - refactor-sections-portfolio
---

# Unifikacja PortfolioCard i SectionsPortfolio z Single Source of Truth

## Analiza obecnego stanu

### Obecne problemy:

1. **PortfolioCard.vue** - przyjmuje `PortfolioProjectEntry` (zależność od content layer)
2. **SectionsPortfolio.vue** - ma własną implementację renderowania, nie używa `PortfolioCard`
3. **Duplikacja logiki** - różne sposoby renderowania projektów
4. **Brak abstrakcji** - komponenty bezpośrednio zależą od struktury content layer
5. **SectionsPortfolio** - przyjmuje hardcoded `projects` w props zamiast pobierać z content

### Obecna struktura:

```
content/portfolio/*.md
  ↓
shared/utils/portfolio.ts (getPortfolioProjects)
  ↓
app/pages/portfolio/index.vue → PortfolioGrid → PortfolioCard
app/components/sections/Portfolio/SectionsPortfolio.vue (własna implementacja)
```

## Plan implementacji

### 1. Architektura danych - Diagram zależności

```
content/portfolio/*.md (Single Source of Truth)
  ↓
shared/utils/portfolio.ts (getPortfolioProjects - warstwa danych)
  ↓
app/composables/usePortfolioContent.ts (composable - adapter)
  ↓ (mapowanie PortfolioProjectEntry → PortfolioCardProps)
  ↓
SectionsPortfolio.vue → PortfolioCard
app/pages/portfolio/index.vue → PortfolioGrid → PortfolioCard
```

### 2. Typy TypeScript - Kontrakt danych

**Plik:** `shared/types/portfolio.ts` (nowy)

**PortfolioCardProps** - stabilny interfejs dla UI:

```typescript
export interface PortfolioCardProps {
  id: string
  title: string
  excerpt: string // description lub excerpt
  coverImage: {
    src: string
    alt: string
  }
  tags: string[] // technologie lub tags
  year?: string
  slug: string
  featured: boolean
  to: string // link do /portfolio/[slug]
  category?: string // pierwszy tag lub category field
  externalLink?: {
    url: string
    target?: string
  } // pierwszy link z project.links
}
```

**PortfolioContentOptions** - opcje dla composable:

```typescript
export interface PortfolioContentOptions {
  limit?: number
  showFeaturedOnly?: boolean
  filterByTags?: string[]
  filterByTechnologies?: string[]
  filterByYear?: string
  sortBy?: 'newest' | 'oldest' | 'featured'
  status?: 'draft' | 'published' | 'archived'
}
```

### 3. Composable usePortfolioContent

**Plik:** `app/composables/usePortfolioContent.ts` (nowy)

**Funkcjonalność:**

- Pobiera dane z `shared/utils/portfolio.ts` (getPortfolioProjects)
- Mapuje `PortfolioProjectEntry[] → PortfolioCardProps[]`
- Filtruje, sortuje, limituje
- Zwraca reactive data z `useAsyncData`

**API:**

```typescript
export function usePortfolioContent(options?: PortfolioContentOptions) {
  const { data, pending, error, refresh } = useAsyncData('portfolio-content', async () => {
    // Pobierz projekty
    const projects = await getPortfolioProjects({
      status: options?.status || 'published',
      tags: options?.filterByTags,
      technologies: options?.filterByTechnologies,
      year: options?.filterByYear,
      featured: options?.showFeaturedOnly ? true : undefined,
    })

    // Mapuj do PortfolioCardProps
    const mapped = projects.map(mapProjectToCardProps)

    // Sortowanie
    const sorted = sortProjects(mapped, options?.sortBy || 'newest')

    // Limit
    return options?.limit ? sorted.slice(0, options.limit) : sorted
  })

  return {
    projects: computed(() => data.value || []),
    pending,
    error,
    refresh,
  }
}
```

**Funkcja mapująca:**

```typescript
function mapProjectToCardProps(project: PortfolioProjectEntry): PortfolioCardProps {
  return {
    id: project._id || project._path,
    title: project.title,
    excerpt: project.excerpt || project.description,
    coverImage: {
      src: project.coverImage?.src || '',
      alt: project.coverImage?.alt || project.title,
    },
    tags: project.technologies || project.tags || [],
    year: project.year,
    slug: project.slug || extractSlugFromPath(project._path),
    featured: project.featured || false,
    to: project.slug ? `/portfolio/${project.slug}` : project._path || '#',
    category: project.category || project.tags?.[0],
    externalLink: project.links?.[0]
      ? {
          url: project.links[0].url,
          target: project.links[0].target,
        }
      : undefined,
  }
}
```

### 4. Refaktoryzacja PortfolioCard

**Plik:** `app/components/portfolio/PortfolioCard.vue`

**Zmiany:**

- Zmiana props z `PortfolioProjectEntry` na `PortfolioCardProps`
- Usunięcie zależności od content layer
- Komponent staje się czysto prezentacyjny

**Nowe props:**

```typescript
interface Props {
  project: PortfolioCardProps
}
```

**Uproszczenia:**

- Usunięcie computed dla `projectLink` (już jest w `project.to`)
- Usunięcie computed dla `coverImage` (już jest w `project.coverImage`)
- Usunięcie computed dla `category` (już jest w `project.category`)
- Usunięcie computed dla `displayTags` (już jest w `project.tags`)

### 5. Refaktoryzacja SectionsPortfolio

**Plik:** `app/components/sections/Portfolio/SectionsPortfolio.vue`

**Zmiany:**

- Usunięcie hardcoded `projects` z props
- Użycie `usePortfolioContent()` composable
- Renderowanie przez `PortfolioCard` zamiast własnej implementacji
- Konfiguracja z `props` (limit, showFeaturedOnly, filterByTags, layout)

**Nowa struktura:**

```vue
<script setup lang="ts">
  import type { SectionPortfolio, SectionBase } from '#shared/types/sections'
  import { usePortfolioContent } from '#app/composables/usePortfolioContent'

  interface Props {
    section: SectionPortfolio
    base: SectionBase
    props: SectionPortfolio['props']
  }

  const props = defineProps<Props>()

  // Pobierz projekty z composable
  const { projects } = usePortfolioContent({
    limit: props.props?.limit,
    showFeaturedOnly: props.props?.showFeaturedOnly,
    filterByTags: props.props?.filterByTags,
    filterByTechnologies: props.props?.filterByTechnologies,
    sortBy: props.props?.sortBy || 'newest',
  })

  // Konfiguracja layoutu
  const config = computed(() => ({
    title: props.base.title,
    description: props.base.description,
    layout: props.props?.layout || 'grid',
    columns: props.props?.columns || 3,
    align: props.base.align || 'center',
  }))
</script>

<template>
  <div>
    <!-- Header -->
    <div v-if="config.title || config.description" :class="['mb-12', headerClasses]">
      <h2 v-if="config.title" class="text-3xl md:text-4xl font-bold mb-4">
        {{ config.title }}
      </h2>
      <p v-if="config.description" class="text-lg text-muted max-w-2xl mx-auto">
        {{ config.description }}
      </p>
    </div>

    <!-- Grid z PortfolioCard -->
    <div :class="gridClasses">
      <PortfolioCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </div>
</template>
```

### 6. Aktualizacja SectionPortfolioSchema

**Plik:** `shared/schemas/sections.ts`

**Zmiany:**

- Usunięcie `projects: array(...)` z props
- Dodanie opcji konfiguracji: - `limit?: number` - `showFeaturedOnly?: boolean` - `filterByTags?: string[]` - `filterByTechnologies?: string[]` - `filterByYear?: string` - `sortBy?: 'newest' | 'oldest' | 'featured'` - `layout?: 'grid' | 'masonry' | 'carousel'` - `columns?: 2 | 3 | 4`

**Nowy schema:**

```typescript
props: object({
  limit: optional(number()),
  showFeaturedOnly: optional(boolean()),
  filterByTags: optional(array(string())),
  filterByTechnologies: optional(array(string())),
  filterByYear: optional(string()),
  sortBy: optional(picklist(['newest', 'oldest', 'featured'] as const)),
  layout: optional(picklist(['grid', 'masonry', 'carousel'] as const)),
  columns: optional(picklist([2, 3, 4] as const)),
})
```

### 7. Refaktoryzacja PortfolioGrid

**Plik:** `app/components/portfolio/PortfolioGrid.vue`

**Zmiany:**

- Zmiana props z `PortfolioProjectEntry[]` na `PortfolioCardProps[]`
- Użycie `PortfolioCard` (już używa, ale typy się zmienią)

### 8. Refaktoryzacja strony /portfolio

**Plik:** `app/pages/portfolio/index.vue`

**Zmiany:**

- Użycie `usePortfolioContent()` zamiast bezpośredniego `getPortfolioProjects()`
- Przekazanie `PortfolioCardProps[]` do `PortfolioGrid`

**Nowa struktura:**

```typescript
// Pobierz projekty przez composable
const { projects } = usePortfolioContent({
  status: 'published',
  sortBy: 'newest',
})
```

### 9. Przykładowa konfiguracja w content

**Plik:** `content/index.md` (przykład użycia sekcji)

```yaml
sections:
  - type: 'portfolio'
    id: 'portfolio-section'
    title: 'Nasze projekty'
    description: 'Zobacz nasze realizacje'
    align: 'center'
    props:
      limit: 6
      showFeaturedOnly: false
      filterByTags: ['E-commerce']
      sortBy: 'newest'
      layout: 'grid'
      columns: 3
```

## Kolejność wykonania

1. Utworzenie `shared/types/portfolio.ts` z typami `PortfolioCardProps` i `PortfolioContentOptions`
2. Utworzenie `app/composables/usePortfolioContent.ts` z composable i funkcją mapującą
3. Refaktoryzacja `PortfolioCard.vue` - zmiana props na `PortfolioCardProps`
4. Aktualizacja `SectionPortfolioSchema` w `shared/schemas/sections.ts`
5. Refaktoryzacja `SectionsPortfolio.vue` - użycie composable i `PortfolioCard`
6. Refaktoryzacja `PortfolioGrid.vue` - zmiana typów na `PortfolioCardProps[]`
7. Refaktoryzacja `app/pages/portfolio/index.vue` - użycie composable
8. Aktualizacja dokumentacji `docs/PORTFOLIO.md`

## Oczekiwane rezultaty

- **Single Source of Truth** - tylko `content/portfolio` jako źródło danych
- **Czysta architektura** - komponenty nie zależą od content layer
- **Reużywalność** - `PortfolioCard` używany wszędzie
- **Konfigurowalność** - `SectionsPortfolio` konfigurowana z page builder
- **Gotowość na API** - `usePortfolioContent` może być zastąpione przez API bez zmian w komponentach
- **Type safety** - stabilny kontrakt danych `PortfolioCardProps`
- **Spójność** - ta sama warstwa danych dla strony i sekcji

## Diagram architektury

```mermaid
graph TD
    A[content/portfolio/*.md] --> B[shared/utils/portfolio.ts]
    B --> C[usePortfolioContent composable]
    C --> D[mapProjectToCardProps]
    D --> E[PortfolioCardProps[]]
    E --> F[SectionsPortfolio.vue]
    E --> G[app/pages/portfolio/index.vue]
    F --> H[PortfolioCard.vue]
    G --> I[PortfolioGrid.vue]
    I --> H
```

## Przyszła rozbudowa

- **API backend** - zastąpienie `getPortfolioProjects` w `usePortfolioContent` przez API call
- **Paginacja** - dodanie `page` i `pageSize` do `PortfolioContentOptions`
- **Wyszukiwanie** - dodanie `search` do `PortfolioContentOptions`
- **Autoryzacja** - obsługa `status: 'draft'` dla zalogowanych użytkowników
- **Cache** - dodanie cache'owania w composable
- **Lazy loading** - dodanie infinite scroll lub paginacji
