---
name: Uporządkowanie Nuxt startera do pełnego full-stack frameworka
overview: 'Refaktoryzacja projektu do czystej, systemowo spójnej architektury z jasnymi warstwami: domain (logika biznesowa), resources (jedyny fetch w UI), server/api (endpointy), oraz ujednolicenie PageSchema z SectionsRenderer. Dodanie Prisma, Valibot walidacji, Motion-v presetów i dokumentacji architektury.'
todos:
  - id: prisma-setup
    content: 'Dodać Prisma: schema.prisma z ContactMessage, server/services/prisma.ts, .env.example z DATABASE_URL'
    status: completed
  - id: domain-layer
    content: 'Utworzyć /domain: shared/result.ts, shared/errors.ts, contact/sendContactMessage.usecase.ts, contact/contact.types.ts'
    status: completed
  - id: valibot-schemas
    content: Dodać shared/schemas/api.ts z ContactFormInputSchema, ContactFormOutputSchema, HealthOutputSchema
    status: completed
  - id: resources-layer
    content: 'Utworzyć app/composables/resources/: useApiClient.ts, useContactResource.ts, usePortfolioResource.ts'
    status: completed
  - id: server-api
    content: 'Utworzyć server/api/: contact.post.ts, health.get.ts z walidacją Valibot i użyciem use-cases'
    status: completed
  - id: server-repositories
    content: Utworzyć server/repositories/contactMessage.repo.ts z Prisma queries
    status: completed
  - id: pageschema-array
    content: 'Zmienić PageSchema w shared/schemas/content.ts: sections z obiektu na array union typów'
    status: completed
  - id: sections-renderer
    content: Utworzyć app/components/sections/SectionsRenderer.vue renderujący sekcje z array
    status: completed
  - id: ui-wrappers
    content: 'Utworzyć app/components/ui/: Section.vue, SectionHeader.vue, AppCard.vue'
    status: completed
  - id: motion-presets
    content: Utworzyć app/composables/ui/useMotionPresets.ts z presetami animacji
    status: completed
  - id: migrate-sections
    content: Przenieść komponenty sekcji z app/components/Page/ do app/components/sections/ i zrefaktoryzować używając wrapperów
    status: completed
  - id: update-pages
    content: Zaktualizować app/pages/*.vue aby używały SectionsRenderer zamiast ContentRenderer dla sekcji
    status: completed
  - id: update-content
    content: 'Zaktualizować content/*.md: zmienić format sections z obiektu na array'
    status: completed
  - id: bun-tooling
    content: 'Zaktualizować package.json: wszystkie skrypty na bun, dodać db:generate, db:migrate, db:studio'
    status: completed
  - id: documentation
    content: 'Zaktualizować README.md: architektura, zasady systemowe, jak dodać nowe elementy'
    status: completed
---

# Uporządkowanie Nuxt startera do pełnego full-stack frameworka

## Analiza obecnego stanu

Projekt już zawiera:

- ✅ Nuxt UI, Motion-v, Valibot (zainstalowane)
- ✅ Strukturę `shared/schemas` i `shared/types`
- ✅ PageSchema z sekcjami (obiekt z polami: hero, features, etc.)
- ✅ `useFilters` composable
- ✅ Komponenty sekcji w `app/components/Page/...`
- ✅ Content layer z Nuxt Content
- ❌ Brak Prisma
- ❌ Brak warstwy `/domain`
- ❌ Brak warstwy `/app/composables/resources`
- ❌ Brak API endpoints w `/server/api`
- ❌ Brak SectionsRenderer
- ❌ PageSchema używa obiektu zamiast array dla sections

## Architektura docelowa

```
┌─────────────────────────────────────────────────────────┐
│                    UI LAYER (app/)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Components   │  │  Composables │  │    Pages     │ │
│  │ (prezentacja)│  │  (resources) │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                           │
└─────────┼──────────────────┼──────────────────────────┘
          │                  │
          │                  ▼
          │         ┌─────────────────┐
          │         │  useApiClient    │
          │         │  (jedyny fetch) │
          │         └─────────────────┘
          │                  │
          ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                 API LAYER (server/api/)                 │
│  ┌──────────────────────────────────────────────────┐ │
│  │  parse input → validate (Valibot) → use-case     │ │
│  │  → return DTO                                    │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              DOMAIN LAYER (/domain/)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  use-cases   │  │   types      │  │   errors     │ │
│  │  (logika)    │  │   (kontrakty)│  │   (result)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│          REPOSITORY LAYER (server/repositories/)        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  contactMessage.repo.ts                          │ │
│  │  (Prisma queries)                                │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────┐
│              DATA LAYER (Prisma)                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │  ContactMessage model                            │ │
│  └──────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Zadania do wykonania

### 1. Struktura katalogów

#### 1.1 Utworzenie `/domain`

- `/domain/contact/`
  - `sendContactMessage.usecase.ts` - logika biznesowa
  - `contact.types.ts` - typy domenowe
- `/domain/portfolio/`
  - `listPortfolio.usecase.ts` - logika biznesowa (opcjonalnie, na przyszłość)
  - `portfolio.types.ts`
- `/domain/page/`
  - `page.types.ts` - typy dla PageSchema
- `/domain/shared/`
  - `result.ts` - Result<T, E> pattern
  - `errors.ts` - błędy domenowe

#### 1.2 Reorganizacja `/app/components`

- Przeniesienie komponentów sekcji:
  - `app/components/Page/Section/` → `app/components/sections/SectionsHero.vue`
  - `app/components/Page/Hero/` → `app/components/sections/SectionsHero.vue` (merge)
  - `app/components/Page/Features/` → `app/components/sections/SectionsFeatures.vue`
  - `app/components/Page/Pricing/` → `app/components/sections/SectionsPricing.vue`
  - `app/components/Page/FAQ/` → `app/components/sections/SectionsFAQ.vue`
  - `app/components/Page/Testimonials/` → `app/components/sections/SectionsTestimonials.vue`
  - `app/components/Page/CTA/` → `app/components/sections/SectionsCTA.vue`
- Utworzenie wrapperów UI:
  - `app/components/ui/Section.vue` - kontener sekcji (spacing, theme, background)
  - `app/components/ui/SectionHeader.vue` - nagłówek sekcji (headline, title, description)
  - `app/components/ui/AppCard.vue` - uniwersalna karta

#### 1.3 Utworzenie `/app/composables/resources`

- `useApiClient.ts` - wrapper na `$fetch` z formatem `{ data, error }`
- `useContactResource.ts` - `submitContactForm(payload)`
- `usePortfolioResource.ts` - adapter content → UI (gotowy na przyszłe API)

#### 1.4 Utworzenie `/server/api`

- `contact.post.ts` - POST `/api/contact`
- `health.get.ts` - GET `/api/health`

#### 1.5 Utworzenie `/server/repositories`

- `contactMessage.repo.ts` - Prisma queries dla ContactMessage

#### 1.6 Utworzenie `/server/services`

- `prisma.ts` - singleton Prisma client

### 2. Prisma - minimalny backend

#### 2.1 Instalacja i konfiguracja

- Dodanie `@prisma/client` i `prisma` do `package.json`
- Utworzenie `prisma/schema.prisma`:

  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "sqlite" // MVP - łatwe do zmiany na PostgreSQL
    url      = env("DATABASE_URL")
  }

  model ContactMessage {
    id        String   @id @default(cuid())
    name      String
    email     String
    message   String
    createdAt DateTime @default(now())
  }
  ```

- Utworzenie `.env.example` z `DATABASE_URL="file:./dev.db"`

#### 2.2 Prisma service

- `server/services/prisma.ts` - singleton pattern dla Prisma client

### 3. Valibot - walidacja i kontrakty

#### 3.1 Schematy API w `shared/schemas/`

- `shared/schemas/api.ts`:
  - `ContactFormInputSchema` - input do POST `/api/contact`
  - `ContactFormOutputSchema` - output DTO
  - `HealthOutputSchema` - output dla `/api/health`

#### 3.2 Walidacja w endpointach

- `server/api/contact.post.ts` - używa `safeParse` z Valibot
- `server/api/health.get.ts` - zwraca zwalidowany DTO

### 4. Warstwa Resources (jedyny fetch w UI)

#### 4.1 `app/composables/resources/useApiClient.ts`

```typescript
export function useApiClient() {
  return {
    async request<T>(
      url: string,
      options?: RequestInit
    ): Promise<{ data: T | null; error: Error | null }> {
      try {
        const response = await $fetch<T>(url, options)
        return { data: response, error: null }
      } catch (err) {
        return { data: null, error: err as Error }
      }
    },
  }
}
```

#### 4.2 `app/composables/resources/useContactResource.ts`

- `submitContactForm(payload)` - używa `useApiClient`

#### 4.3 `app/composables/resources/usePortfolioResource.ts`

- Adapter z `usePortfolioContent` (obecny composable)
- Gotowy na przyszłe API endpoint

### 5. Domain Layer - logika biznesowa

#### 5.1 `/domain/shared/result.ts`

- Result<T, E> pattern dla bezpiecznego obsługiwania błędów

#### 5.2 `/domain/shared/errors.ts`

- Błędy domenowe (ValidationError, NotFoundError, etc.)

#### 5.3 `/domain/contact/sendContactMessage.usecase.ts`

- Logika biznesowa (honeypot check, rate limit placeholder)
- Używa repository
- Zwraca Result

### 6. Server API - endpointy MVP

#### 6.1 `server/api/contact.post.ts`

```typescript
export default defineEventHandler(async (event) => {
  // 1. Parse body
  const body = await readBody(event)

  // 2. Validate (Valibot)
  const result = safeParse(ContactFormInputSchema, body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  // 3. Call use-case
  const useCaseResult = await sendContactMessageUseCase(result.output)

  // 4. Return DTO
  return { data: useCaseResult.value }
})
```

#### 6.2 `server/api/health.get.ts`

- Zwraca `{ ok: true, version, timestamp }`

### 7. PageSchema - ujednolicenie

#### 7.1 Zmiana schematu w `shared/schemas/content.ts`

- Zmiana `sections` z obiektu na array:
  ```typescript
  sections: optional(
    array(
      union([
        SectionHeroSchema,
        SectionFeaturesSchema,
        SectionCTASchema,
        // ...
      ])
    )
  )
  ```

#### 7.2 Utworzenie `app/components/sections/SectionsRenderer.vue`

- Renderuje sekcje z array
- Filtruje po `enabled`
- Dynamiczne renderowanie przez `component :is`

#### 7.3 Aktualizacja content files

- `content/index.md` - zmiana formatu sections na array
- `content/oferta.md` - jeśli używa sections
- `content/o-nas.md` - jeśli używa sections

### 8. UI Wrappers

#### 8.1 `app/components/ui/Section.vue`

- Props: `spacing`, `theme`, `background`, `container`
- Wrapper z odpowiednimi klasami Tailwind

#### 8.2 `app/components/ui/SectionHeader.vue`

- Props: `headline`, `title`, `description`, `icon`
- Używa Nuxt UI components

#### 8.3 `app/components/ui/AppCard.vue`

- Uniwersalna karta z Nuxt UI

#### 8.4 Refaktoryzacja komponentów sekcji

- Wszystkie sekcje używają `Section.vue` i `SectionHeader.vue`

### 9. Motion-v - standard animacji

#### 9.1 `app/composables/ui/useMotionPresets.ts`

```typescript
export function useMotionPresets() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  return {
    fadeUp: {
      /* ... */
    },
    fadeIn: {
      /* ... */
    },
    staggerList: {
      /* ... */
    },
    drawerIn: {
      /* ... */
    },
    modalScale: {
      /* ... */
    },
  }
}
```

#### 9.2 Zastosowanie w komponentach

- Hero - fadeUp
- Features/Portfolio - staggerList
- FiltersDrawer - drawerIn

### 10. Filters - globalny drawer

#### 10.1 `app/composables/useFilters.ts`

- Już istnieje - sprawdzić zgodność z wymaganiami

#### 10.2 `app/components/Filters/FiltersDrawer.vue`

- Sprawdzić czy używa Teleport → body
- Auto close on route change (już jest w useFilters)

#### 10.3 `app/components/Header/Header.vue`

- Button "Filtry" widoczny tylko gdy `hasFilters === true`

### 11. Bun jako primary runtime

#### 11.1 Aktualizacja `package.json`

- Zmiana wszystkich skryptów na `bun`
- Dodanie skryptów:
  - `bun db:generate` - `prisma generate`
  - `bun db:migrate` - `prisma migrate dev`
  - `bun db:studio` - `prisma studio`

#### 11.2 Aktualizacja README

- Bun jako primary runtime
- Instrukcje instalacji z Bun

### 12. Dokumentacja

#### 12.1 Aktualizacja README.md

- Sekcja "Architektura" z diagramem warstw
- Sekcja "Zasady systemowe" (zakazy)
- Sekcja "Jak dodać..." z przykładami:
  - Nową sekcję
  - Nowy endpoint
  - Nowy use-case w domain
  - Nowy resource
  - Nową stronę contentową

#### 12.2 Komentarze w kodzie

- JSDoc w use-cases
- Komentarze w resources
- Komentarze w API endpoints

## Migracja istniejących komponentów

### Komponenty do przeniesienia/refaktoryzacji:

1. `app/components/Page/Section/PageSection.vue` → użyć w SectionsRenderer
2. `app/components/Page/Hero/PageHero.vue` → `app/components/sections/SectionsHero.vue`
3. `app/components/Page/Features/` → `app/components/sections/SectionsFeatures.vue`
4. `app/components/Page/Pricing/PagePricing.vue` → `app/components/sections/SectionsPricing.vue`
5. `app/components/Page/FAQ/PageFaq.vue` → `app/components/sections/SectionsFAQ.vue`
6. `app/components/Page/Testimonials/PageTestimonials.vue` → `app/components/sections/SectionsTestimonials.vue`
7. `app/components/Page/CTA/PageCta.vue` → `app/components/sections/SectionsCTA.vue`

### Strony do aktualizacji:

1. `app/pages/index.vue` - użyć SectionsRenderer zamiast ContentRenderer
2. `app/pages/oferta.vue` - użyć SectionsRenderer
3. `app/pages/o-nas.vue` - użyć SectionsRenderer
4. `app/pages/kontakt.vue` - dodać formularz używający `useContactResource`

## Kolejność wykonania

1. **Infrastruktura** (Prisma, domain layer, result pattern)
2. **Schematy i typy** (Valibot schemas, domain types)
3. **Resources layer** (useApiClient, useContactResource)
4. **Server layer** (API endpoints, repositories, services)
5. **PageSchema refaktoryzacja** (array sections, SectionsRenderer)
6. **UI wrappers** (Section, SectionHeader, AppCard)
7. **Motion-v presets** (useMotionPresets, zastosowanie)
8. **Migracja komponentów** (przeniesienie i refaktoryzacja)
9. **Aktualizacja stron** (użycie SectionsRenderer)
10. **Bun tooling** (package.json, README)
11. **Dokumentacja** (README, komentarze)

## Pliki kluczowe do zmiany

- `package.json` - Bun scripts, Prisma dependencies
- `nuxt.config.ts` - imports dla domain layer (opcjonalnie)
- `shared/schemas/content.ts` - PageSchema sections jako array
- `shared/schemas/api.ts` - nowy plik z schematami API
- `content/index.md` - format sections na array
- `app/pages/*.vue` - użycie SectionsRenderer
- `README.md` - dokumentacja architektury

## Uwagi

- Nie niszczyć istniejącej pracy - refaktoryzacja, nie przepisywanie
- Zachować kompatybilność z istniejącym contentem gdzie możliwe
- MVP scope - nie dodawać niepotrzebnych funkcji
- Minimalizm przez jasne granice, nie przez skróty
