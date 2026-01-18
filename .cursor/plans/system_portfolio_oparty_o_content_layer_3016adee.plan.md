---
name: System Portfolio oparty o Content Layer
overview: Projektowanie i implementacja systemu Portfolio w Nuxt opartego o Content Layer, gotowego na przyszłą autoryzację i backend, z pełną separacją warstwy treści od prezentacji.
todos: []
---

# System Portfolio oparty o Content Layer

## Analiza obecnego stanu

### Istniejące wzorce:

- Blog używa `BlogPostSchema` w `content.config.ts` z kolekcją `blog/*.md`
- Strony używają `PageSchema` z page builder (sections)
- Typy TypeScript są generowane z Valibot schemas przez `InferOutput`
- Komponenty są reużywalne i oparte o Nuxt UI

### Obecna strona Portfolio:

- Hardcoded dane w `app/pages/portfolio/index.vue`
- Używa komponentu `PortfolioCard.vue`
- Brak integracji z Content Layer
- Brak strony szczegółowej projektu

## Plan implementacji

### 1. Struktura folderów content

**Struktura:**

```
content/
├── portfolio/
│   ├── index.md          # Konfiguracja strony Portfolio (SEO, hero, sections)
│   ├── project-1.md     # Przykładowy projekt
│   ├── project-2.md     # Przykładowy projekt
│   └── project-*.md     # Kolejne projekty
```

**Uzasadnienie:**

- `portfolio/index.md` - używa `PageSchema` z page builder (jak `index.md`, `oferta.md`)
- `portfolio/project-*.md` - używa `PortfolioProjectSchema` (nowy schema)

### 2. Schema danych projektu (PortfolioProjectSchema)

**Plik:** `shared/schemas/content.ts`

**Minimalne pola:**

- `title: string()` - tytuł projektu
- `slug: optional(string())` - slug (auto-generowany z nazwy pliku jeśli brak)
- `description: string()` - krótki opis (do listy)
- `excerpt: optional(string())` - dodatkowy excerpt (dłuższy niż description)
- `coverImage: ImageSchema` - główny obraz projektu
- `tags: optional(array(string()))` - tagi kategorii (np. 'E-commerce', 'Marketing')
- `technologies: optional(array(string()))` - technologie (np. 'Nuxt', 'Vue', 'TypeScript')
- `year: optional(string())` - rok realizacji
- `role: optional(string())` - rola w projekcie (np. 'Full-stack Developer')
- `client: optional(string())` - nazwa klienta
- `featured: optional(boolean())` - czy projekt wyróżniony
- `status: optional(picklist(['draft', 'published', 'archived']))` - status (default: 'published')
- `publishedAt: optional(date())` - data publikacji

**Dodatkowe pola:**

- `seo: optional(SEOSchema)` - meta SEO
- `gallery: optional(array(ImageSchema))` - galeria obrazów
- `links: optional(array(object({ type: string, label: string, url: string, target?: string })))` - linki (live, github, behance)
- `category: optional(string())` - kategoria (alias dla pierwszego tagu)

**Przykład schematu:**

```typescript
export const PortfolioProjectLinkSchema = object({
  type: picklist(['live', 'github', 'behance', 'dribbble', 'figma', 'other'] as const),
  label: string(),
  url: string(),
  target: optional(picklist(['_self', '_blank'] as const)),
})

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
  category: optional(string()),
})
```

### 3. Integracja z content.config.ts

**Plik:** `content.config.ts`

**Zmiany:**

- Dodać import `PortfolioProjectSchema`
- Dodać kolekcję `portfolio`:

```typescript
portfolio: defineCollection({
  type: 'page',
  source: 'portfolio/*.md',
  schema: PortfolioProjectSchema,
})
```

**Uwaga:** `portfolio/index.md` będzie obsługiwany przez kolekcję `pages` (bo jest w root `*.md`)

### 4. Typy TypeScript

**Plik:** `shared/types/content.ts`

**Zmiany:**

- Dodać import `PortfolioProjectSchema`
- Dodać typy:

```typescript
export type PortfolioProject = InferOutput<typeof PortfolioProjectSchema>

export type PortfolioProjectEntry = PortfolioProject & {
  _path: string
  _id: string
  _type: string
}
```

### 5. Strona listy Portfolio

**Plik:** `app/pages/portfolio/index.vue` (refaktoryzacja)

**Funkcjonalność:**

- Pobieranie konfiguracji strony z `content/portfolio/index.md` (używa `PageSchema`)
- Pobieranie projektów z kolekcji `portfolio` (tylko `status: 'published'`)
- Filtrowanie po tagach, technologiach, roku
- Sortowanie (domyślnie: `publishedAt DESC` lub `year DESC`)
- Układ grid z możliwością oznaczenia `featured`

**Struktura:**

```vue
<script setup lang="ts">
  import type { PageEntry, PortfolioProjectEntry } from '#shared/types/content'
  import { getPageSections } from '#shared/utils/sections'

  // Pobierz konfigurację strony
  const { data: page } = await useAsyncData('portfolio-page', () =>
    queryCollection<PageEntry>('pages').path('/portfolio').first()
  )

  // Pobierz projekty (tylko published)
  const { data: projects } = await useAsyncData('portfolio-projects', () =>
    queryCollection<PortfolioProjectEntry>('portfolio')
      .where('status', '=', 'published')
      .order('publishedAt', 'DESC')
      .all()
  )

  // Filtry i sortowanie (computed)
  const filteredProjects = computed(() => {
    // Logika filtrowania
  })

  // Sekcje z page builder
  const sections = computed(() => {
    if (!page.value) return []
    return getPageSections(page.value)
  })
</script>

<template>
  <NuxtLayout name="default">
    <UPage>
      <UPageBody>
        <!-- Page builder sections (hero, etc.) -->
        <SectionsRenderer :sections="sections" />

        <!-- Portfolio Grid z filtrami -->
        <PortfolioGrid :projects="filteredProjects" />
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
```

### 6. Komponent PortfolioGrid

**Plik:** `app/components/portfolio/PortfolioGrid.vue` (nowy)

**Funkcjonalność:**

- Filtry (tagi, technologie, rok)
- Sortowanie
- Grid layout z obsługą `featured`
- Użycie istniejącego `PortfolioCard.vue` (refaktoryzacja)

**Props:**

```typescript
interface Props {
  projects: PortfolioProjectEntry[]
  showFilters?: boolean
  layout?: 'grid' | 'masonry'
}
```

### 7. Refaktoryzacja PortfolioCard

**Plik:** `app/components/portfolio/PortfolioCard.vue`

**Zmiany:**

- Zaktualizować props aby przyjmowały `PortfolioProjectEntry` lub wyodrębnione pola
- Dodać obsługę `technologies`, `year`, `role`
- Dodać link do strony szczegółowej (`/portfolio/[slug]`)

### 8. Strona szczegółowa projektu (Case Study)

**Plik:** `app/pages/portfolio/[slug].vue` (nowy)

**Funkcjonalność:**

- Dynamic route `/portfolio/[slug]`
- Pobieranie projektu z kolekcji `portfolio`
- Renderowanie markdown content (MD/MDX)
- Sekcje: Overview, Problem/Solution, Tech Stack, Gallery, Result
- CTA sekcja
- Schema.org (CreativeWork / Project)
- SEO meta

**Struktura:**

```vue
<script setup lang="ts">
  import type { PortfolioProjectEntry } from '#shared/types/content'
  import { defineCreativeWork } from 'nuxt-schema-org/schema'

  const route = useRoute()
  const slug = route.params.slug as string

  // Pobierz projekt
  const { data: project } = await useAsyncData(`portfolio-${slug}`, () =>
    queryCollection<PortfolioProjectEntry>('portfolio')
      .where('slug', '=', slug)
      .where('status', '=', 'published')
      .first()
  )

  if (!project.value) {
    throw createError({ statusCode: 404, statusMessage: 'Project not found' })
  }

  // Schema.org
  const projectSchema = computed(() => {
    return defineCreativeWork({
      name: project.value.title,
      description: project.value.description,
      image: project.value.coverImage?.src,
      datePublished: project.value.publishedAt,
      keywords: project.value.technologies?.join(', '),
    })
  })

  useSchemaOrg([projectSchema.value])
</script>

<template>
  <NuxtLayout name="default">
    <!-- Hero projektu -->
    <PortfolioHero :project="project" />

    <!-- Content (markdown) -->
    <UPage>
      <UPageBody>
        <ContentRenderer :value="project" />
      </UPageBody>
    </UPage>

    <!-- CTA -->
    <SectionsCTA :section="ctaSection" />
  </NuxtLayout>
</template>
```

### 9. Komponent PortfolioHero

**Plik:** `app/components/portfolio/PortfolioHero.vue` (nowy)

**Funkcjonalność:**

- Wyświetlanie coverImage, title, description
- Meta informacje (year, role, client, technologies)
- Linki (live, github, etc.)
- Breadcrumbs

### 10. Content: portfolio/index.md

**Plik:** `content/portfolio/index.md` (nowy)

**Struktura:**

```yaml
---
title: Portfolio
description: Zobacz nasze realizacje i projekty
to: '/portfolio'
sections:
  - type: 'hero'
    id: 'hero'
    title: 'Nasze Portfolio'
    description: 'Zobacz nasze realizacje i projekty'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'centered'
      variant: 'primary'
---
```

### 11. Content: Przykładowy projekt

**Plik:** `content/portfolio/project-1.md` (nowy)

**Struktura:**

```yaml
---
title: 'Projekt E-commerce'
slug: 'project-1'
description: 'Nowoczesny sklep internetowy z pełną funkcjonalnością'
excerpt: 'Szczegółowy opis projektu...'
coverImage:
  src: '/portfolio/project_1.png'
  alt: 'Projekt E-commerce'
tags:
  - 'E-commerce'
  - 'Strony WWW'
technologies:
  - 'Nuxt'
  - 'Vue'
  - 'TypeScript'
year: '2024'
role: 'Full-stack Developer'
client: 'Example Client'
featured: true
status: 'published'
publishedAt: 2024-01-15
seo:
  title: 'Projekt E-commerce - Portfolio'
  description: 'Nowoczesny sklep internetowy...'
links:
  - type: 'live'
    label: 'Zobacz live'
    url: 'https://example.com'
    target: '_blank'
  - type: 'github'
    label: 'GitHub'
    url: 'https://github.com/...'
gallery:
  - src: '/portfolio/project_1.png'
    alt: 'Screenshot 1'
  - src: '/portfolio/project_2.png'
    alt: 'Screenshot 2'
---
# Overview

Treść projektu w markdown...
## Problem

...
## Solution
...
## Tech Stack
...
## Result
...
```

### 12. Przygotowanie pod przyszłą autoryzację

**Abstrakcja warstwy danych:**

**Plik:** `shared/utils/portfolio.ts` (nowy)

**Funkcje:**

```typescript
// Abstrakcja pobierania projektów
export async function getPortfolioProjects(filters?: {
  status?: 'draft' | 'published' | 'archived'
  tags?: string[]
  technologies?: string[]
  year?: string
  featured?: boolean
}): Promise<PortfolioProjectEntry[]> {
  // Obecnie: queryCollection('portfolio')
  // W przyszłości: może być API call
  // Struktura danych pozostaje identyczna
}

// Abstrakcja pobierania pojedynczego projektu
export async function getPortfolioProject(slug: string): Promise<PortfolioProjectEntry | null> {
  // Obecnie: queryCollection('portfolio').where('slug', '=', slug).first()
  // W przyszłości: może być API call
}
```

**Uzasadnienie:**

- UI używa funkcji z `shared/utils/portfolio.ts`
- Funkcje mogą być łatwo zastąpione przez API calls
- Struktura danych pozostaje identyczna
- Status `draft` jest już w schemacie (gotowe na autoryzację)

### 13. Dokumentacja

**Plik:** `docs/PORTFOLIO.md` (nowy)

**Zawartość:**

- Jak dodać nowy projekt (tworzenie pliku `.md`)
- Struktura frontmatter
- Przykłady
- Jak używać filtrów i sortowania
- Jak przygotować case study

## Kolejność wykonania

1. Utworzenie `PortfolioProjectSchema` w `shared/schemas/content.ts`
2. Dodanie typów w `shared/types/content.ts`
3. Dodanie kolekcji `portfolio` w `content.config.ts`
4. Utworzenie `shared/utils/portfolio.ts` (abstrakcja warstwy danych)
5. Utworzenie `content/portfolio/index.md`
6. Utworzenie przykładowych projektów (`project-1.md`, `project-2.md`)
7. Refaktoryzacja `PortfolioCard.vue`
8. Utworzenie `PortfolioGrid.vue`
9. Utworzenie `PortfolioHero.vue`
10. Refaktoryzacja `app/pages/portfolio/index.vue`
11. Utworzenie `app/pages/portfolio/[slug].vue`
12. Utworzenie dokumentacji `docs/PORTFOLIO.md`

## Oczekiwane rezultaty

- Portfolio oparte o Content Layer (łatwe dodawanie projektów przez `.md`)
- Gotowość na autoryzację (status `draft`, abstrakcja warstwy danych)
- Gotowość na backend (funkcje w `shared/utils/portfolio.ts` mogą być zastąpione API)
- Spójność z istniejącym systemem (blog, pages)
- Reużywalne komponenty (PortfolioCard, PortfolioGrid, PortfolioHero)
- SEO i Schema.org
- Filtrowanie i sortowanie projektów
- Strona szczegółowa z case study (markdown content)
