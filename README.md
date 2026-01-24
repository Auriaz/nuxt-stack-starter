# Nuxt Base Starter

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.2.2-00DC82?logo=nuxt)](https://nuxt.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)

Solidna "podkładka pod strony internetowe" oparta o Nuxt 4, gotowa do wielokrotnego użycia i łatwa do aktualizowania. Starter zawiera podstawowe podstrony, layouty, SEO baseline oraz zestaw modułów Nuxt skonfigurowanych produkcyjnie.

## ✨ Funkcje

- 🚀 **Nuxt 4** - Najnowsza wersja z pełnym wsparciem TypeScript
- 🎨 **Nuxt UI** - Gotowe komponenty UI zgodne z najlepszymi praktykami
- 🌍 **i18n** - Wielojęzyczność out-of-the-box (PL/EN)
- 📝 **Nuxt Content** - Blog z systemem zarządzania treścią
- 🔍 **SEO Ready** - Kompletna konfiguracja SEO (meta tags, sitemap, OpenGraph)
- ♿ **A11y** - Wsparcie dla dostępności
- 🧪 **Testy** - Konfiguracja Vitest (unit/component) i Playwright (E2E)
- 📱 **Responsywny** - Mobile-first design
- 🌙 **Dark Mode** - Wsparcie dla trybu ciemnego
- 📧 **Formularze** - Gotowy formularz kontaktowy z walidacją

## 📦 Zawartość

### Strony

- `/` - Strona główna z sekcjami (Hero, Features, Testimonials, CTA)
- `/oferta` - Strona oferty z cennikiem i FAQ
- `/portfolio` - Portfolio z przykładami projektów
- `/o-nas` - Strona o nas
- `/kontakt` - Formularz kontaktowy
- `/blog` - Blog z Nuxt Content

### Komponenty

- **Sekcje**: Hero, Features, Pricing, Testimonials, FAQ, CTA
- **UI**: CTA, Card
- **Layout**: Header, Footer, Navbar
- **Portfolio**: PortfolioCard
- **Blog**: Komponenty Nuxt UI dla bloga

### Moduły Nuxt

- `@nuxt/eslint` - Linting
- `@nuxt/ui` - Komponenty UI
- `@nuxt/a11y` - Dostępność
- `@nuxt/content` - Zarządzanie treścią
- `@nuxt/hints` - Performance hints
- `@nuxt/image` - Optymalizacja obrazów
- `@nuxt/scripts` - Zarządzanie skryptami
- `@nuxt/test-utils` - Narzędzia testowe
- `@nuxtjs/i18n` - Wielojęzyczność
- `@nuxtjs/seo` - SEO

## 🚀 Quick Start

### Instalacja

```bash
# Sklonuj repozytorium
git clone https://github.com/Auriaz/nuxt-base-starter.git
cd nuxt-base-starter

# Zainstaluj zależności (Bun jest primary runtime)
bun install
```

### Konfiguracja bazy danych

```bash
# Wygeneruj Prisma Client
bun db:generate

# Utwórz migrację
bun db:migrate

# Otwórz Prisma Studio (opcjonalnie)
bun db:studio
```

### Konfiguracja

1. Skopiuj `.env.example` do `.env` i ustaw zmienne środowiskowe:

```bash
cp .env.example .env
```

2. Zaktualizuj `nuxt.config.ts` z własnymi danymi:

```typescript
site: {
  url: process.env.NUXT_PUBLIC_SITE_URL || 'https://yourdomain.com',
  name: 'Your Site Name',
  description: 'Your site description',
  defaultLocale: 'pl'
}
```

### Development

```bash
# Uruchom serwer deweloperski
bun dev

# Linting
bun lint
bun lint:fix

# Formatowanie
bun format

# Type checking
bun typecheck
```

### Production

```bash
# Build
bun build

# Preview
bun preview
```

## 🧪 Testy

```bash
# Wszystkie testy
bun test

# Unit tests
bun test:unit

# Component tests
bun test:nuxt

# E2E tests
bun test:e2e

# E2E tests z UI
bun test:e2e:ui
```

## 📁 Struktura projektu

```
nuxt-base-starter/
├── app/
│   ├── components/      # Komponenty Vue (prezentacyjne)
│   │   ├── sections/   # Sekcje strony (SectionsHero, SectionsFeatures, etc.)
│   │   ├── ui/         # Wrappery UI (Section, SectionHeader, AppCard)
│   │   ├── layout/     # Komponenty layoutu (Header, Footer)
│   │   └── portfolio/  # Komponenty portfolio
│   ├── composables/
│   │   ├── resources/  # Jedyny fetch w UI (useApiClient, useContactResource, etc.)
│   │   └── ui/         # Composables UI (useMotionPresets, useFilters)
│   ├── layouts/        # Layouty
│   ├── pages/          # Strony (file-based routing)
│   ├── assets/         # Zasoby przetwarzane przez Vite
│   └── utils/          # Utility functions
├── domain/             # Logika biznesowa (use-cases, types, errors)
│   ├── contact/        # Use-case: sendContactMessage
│   ├── portfolio/      # Use-case: listPortfolio (opcjonalnie)
│   └── shared/         # Result pattern, błędy domenowe
├── server/
│   ├── api/            # Endpointy API (parse → validate → use-case → DTO)
│   ├── repositories/   # Prisma queries (abstrakcja bazy danych)
│   └── services/       # Serwisy (prisma.ts - singleton)
├── shared/             # Współdzielone typy, schematy i utils
│   ├── types/          # TypeScript types (auto-importowane)
│   ├── schemas/        # Valibot schemas (walidacja)
│   └── utils/          # Pure utility functions
├── content/            # Nuxt Content files
│   ├── pages/          # Strony contentowe
│   ├── blog/           # Wpisy bloga
│   └── portfolio/      # Projekty portfolio
├── prisma/             # Prisma schema i migracje
│   └── schema.prisma   # Model bazy danych
├── public/             # Pliki statyczne
├── test/               # Vitest tests
├── tests/              # Playwright E2E tests
└── i18n/               # Pliki tłumaczeń
```

## 🏗️ Architektura

Projekt używa warstwowej architektury z jasnymi granicami odpowiedzialności:

### Warstwy

1. **UI Layer** (`app/`)
   - Komponenty Vue - czysto prezentacyjne (props + UI + motion)
   - Composables resources - jedyny fetch w UI
   - Pages - używają SectionsRenderer

2. **API Layer** (`server/api/`)
   - Parse input → Validate (Valibot) → Call use-case → Return DTO
   - Brak logiki biznesowej

3. **Domain Layer** (`domain/`)
   - Use-cases - logika biznesowa
   - Types - kontrakty domenowe
   - Errors - błędy domenowe
   - Result pattern - bezpieczne obsługiwanie błędów

4. **Repository Layer** (`server/repositories/`)
   - Prisma queries
   - Abstrakcja bazy danych

5. **Data Layer** (Prisma)
   - Model bazy danych
   - Migracje

### Flow danych

```
UI Component
    ↓ (używa)
Resource Composable (useApiClient)
    ↓ (fetch)
API Endpoint
    ↓ (walidacja Valibot)
Use-case (domain/)
    ↓ (używa)
Repository
    ↓ (Prisma)
Database
```

## ⚠️ Zasady systemowe

**KRYTYCZNE - bez wyjątków:**

1. **Komponenty Vue** (`app/components`, `app/pages`):
   - ❌ NIE wykonują fetch
   - ❌ NIE znają API
   - ✅ Są czysto prezentacyjne (props + UI + motion)

2. **Jedyny fetch w UI** odbywa się przez warstwę `resources`:
   - `app/composables/resources/*`
   - np. `useContactResource()`, `usePortfolioResource()`

3. **server/api/\***:
   - ❌ NIE zawiera logiki biznesowej
   - ✅ Robi tylko: parse input → validate → call use-case → return DTO

4. **Logika biznesowa** ma jedno miejsce:
   - `/domain/*`
   - Use-case'y, reguły, kontrakty, mapowania

5. **Content** (Nuxt Content):
   - ✅ Tylko marketing, blog, portfolio, statyczne strony
   - ❌ Żadnych bytów aplikacyjnych / DB

6. **Jeden model stron**:
   - PageSchema (seo + sections[])
   - UI budowane wyłącznie przez SectionsRenderer
   - ❌ Brak "magicznych" pól UI w root

## 📖 Jak dodać...

### Nową sekcję (opartą o PageSection)

1. Dodaj schemat w `shared/schemas/sections.ts` jako rozszerzenie `SectionBaseSchema`:

```typescript
export const SectionMyNewSectionSchema = object({
  ...SectionBaseSchema.entries,
  type: literal('my-new-section'),
  // ... pola specyficzne dla sekcji
})
```

2. Dodaj typ w `shared/types/sections.ts`:

```typescript
export type SectionMyNewSection = InferOutput<typeof SectionMyNewSectionSchema>
```

3. Utwórz komponent w `app/components/sections/SectionsMyNewSection.vue`,
   który renderuje **tylko treść** sekcji (bez własnego wrappera layoutu),
   a za layout odpowiada `PageSection`:

```vue
<script setup lang="ts">
  import type { SectionMyNewSection } from '#shared/types/sections'

  const props = defineProps<{
    section: SectionMyNewSection
  }>()
</script>

<template>
  <!-- Tutaj tylko treść sekcji, np. karty / grid / CTA -->
  <div class="grid gap-6">
    <!-- ... -->
  </div>
</template>
```

4. Zarejestruj w `app/components/sections/SectionsRenderer.vue`,
   aby `SectionsRenderer` mógł rozwiązać komponent treści:

```typescript
const sectionComponents = {
  // ...
  'my-new-section': SectionsMyNewSection,
}
```

5. Dodaj do union w `shared/schemas/content.ts`:

```typescript
sections: optional(
  array(
    union([
      // ...
      SectionMyNewSectionSchema,
    ])
  )
)
```

### Nowy endpoint API

1. Utwórz `server/api/my-endpoint.post.ts`:

```typescript
import { safeParse } from 'valibot'
import { MyInputSchema } from '~/shared/schemas/api'
import { myUseCase } from '~/domain/my-domain/my.usecase'
import { myRepository } from '~/server/repositories/my.repo'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const result = safeParse(MyInputSchema, body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: 'Invalid input' })
  }

  const useCaseResult = await myUseCase(result.output, myRepository)

  if (isErr(useCaseResult)) {
    throw createError({
      statusCode: useCaseResult.error.statusCode,
      message: useCaseResult.error.message,
    })
  }

  return { data: useCaseResult.value }
})
```

2. Dodaj schematy w `shared/schemas/api.ts`:

```typescript
export const MyInputSchema = object({
  /* ... */
})
export const MyOutputSchema = object({
  /* ... */
})
```

### Nowy use-case w domain

1. Utwórz `domain/my-domain/my.types.ts`:

```typescript
export interface MyInput {
  // ...
}

export interface MyOutput {
  // ...
}
```

2. Utwórz `domain/my-domain/my.usecase.ts`:

```typescript
import type { MyInput, MyOutput } from './my.types'
import type { MyRepository } from '~/server/repositories/my.repo'
import { ok, err, type Result } from '../shared/result'
import { ValidationError } from '../shared/errors'

export async function myUseCase(
  input: MyInput,
  repository: MyRepository
): Promise<Result<MyOutput, ValidationError>> {
  // Logika biznesowa
  try {
    const result = await repository.create(input)
    return ok(result)
  } catch (error) {
    return err(new ValidationError('Failed'))
  }
}
```

3. Utwórz repository w `server/repositories/my.repo.ts`:

```typescript
import { prisma } from '../services/prisma'

export interface MyRepository {
  create(input: MyInput): Promise<MyOutput>
}

export const myRepository: MyRepository = {
  async create(input) {
    // Prisma query
  },
}
```

### Nowy resource

1. Utwórz `app/composables/resources/useMyResource.ts`:

```typescript
import { useApiClient } from './useApiClient'

export function useMyResource() {
  const apiClient = useApiClient()

  async function submitMyForm(payload: MyInput) {
    return await apiClient.request<MyOutput>('/api/my-endpoint', {
      method: 'POST',
      body: payload,
    })
  }

  return {
    submitMyForm,
  }
}
```

### Nową stronę contentową

1. Utwórz `content/my-page.md`:

```markdown
---
title: 'Moja strona'
description: 'Opis strony'
sections:
  - type: 'hero'
    title: 'Tytuł'
    # ...
  - type: 'features'
    # ...
---
```

2. Strona jest automatycznie dostępna pod `/my-page` dzięki file-based routing

## 🔧 Konfiguracja

### SEO

SEO jest automatycznie konfigurowane przez `@nuxtjs/seo`. Użyj composable `usePageSeo` dla dodatkowych meta tags:

```typescript
usePageSeo({
  title: 'Tytuł strony',
  description: 'Opis strony',
  image: '/custom-og-image.png',
})
```

### i18n

Domyślnie starter obsługuje PL (domyślny) i EN. Dodaj więcej języków w `nuxt.config.ts`:

```typescript
i18n: {
  locales: [
    { code: 'pl', iso: 'pl-PL', file: 'pl.json', name: 'Polski' },
    { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' },
  ]
}
```

### Plausible Analytics

Aby włączyć Plausible Analytics, ustaw zmienną środowiskową:

```bash
NUXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Struktura zasobów (public/ vs app/assets/)

**public/** - Pliki statyczne serwowane bezpośrednio:

- Favicon, ikony PWA (`/favicon.ico`, `/icons/`)
- Obrazy OpenGraph (`/images/og-image.png`)
- Obrazy używane w content markdown
- Dokumenty do pobrania

**app/assets/** - Zasoby przetwarzane przez Vite:

- CSS (`app/assets/css/main.css`)
- Obrazy importowane w komponentach (optymalizowane przez Vite)
- SVG jako komponenty Vue
- Fonty (jeśli lokalne)

**Kiedy używać którego:**

- `public/` - gdy potrzebujesz bezpośredniego URL (meta tags, content markdown)
- `app/assets/` - gdy importujesz w komponentach (optymalizacja, cache busting)

### Shared Types & Schemas

Starter używa architektury opartej na schematach Valibot jako single source of truth:

- **`shared/schemas/`** - Schematy Valibot dla walidacji runtime (Content, API, etc.)
- **`shared/types/`** - Typy TypeScript wywnioskowane z schematów (auto-importowane)
- **`shared/utils/`** - Pure utility functions (auto-importowane)

#### Przykład użycia

```typescript
// W content.config.ts (explicit import - auto-importy nie działają)
import { BlogPostSchema } from './shared/schemas/content'

// W komponencie (auto-import działa)
import type { BlogPostEntry } from '~/shared/types/content'

const { data: posts } = await useAsyncData('blog', () =>
  queryCollection<BlogPostEntry>('blog').all()
)

// Utils są auto-importowane
const formattedDate = formatDate(post.date)
```

#### Architektura

```
Markdown frontmatter
    ↓
Valibot Schema (shared/schemas/)
    ↓
Validated Data (runtime)
    ↓
TypeScript Type (shared/types/ - InferOutput)
    ↓
Typed Component/API
```

Wszystkie typy i utils z `shared/` są automatycznie importowane dzięki konfiguracji w `nuxt.config.ts`.

## 🗄️ Baza danych (Prisma)

Projekt używa Prisma jako ORM. Minimalny model zawiera:

- `ContactMessage` - wiadomości z formularza kontaktowego

### Komendy Prisma

```bash
# Wygeneruj Prisma Client
bun db:generate

# Utwórz migrację
bun db:migrate

# Otwórz Prisma Studio (GUI do bazy danych)
bun db:studio
```

### Konfiguracja

Ustaw `DATABASE_URL` w `.env`:

```bash
DATABASE_URL="file:./dev.db"  # SQLite (MVP)
# lub
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"  # PostgreSQL
```

## 📚 Rozszerzanie startera

Starter został zaprojektowany jako "update-owalny" fundament. Możesz rozszerzać go przez:

1. **Nuxt Layers** - Dla większych modułów (auth, dashboard, etc.)
2. **NPM Packages** - Dla małych utilities
3. **Lokalne modyfikacje** - Bezpośrednie zmiany w kodzie

### Przykład użycia jako Layer

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@Auriaz/nuxt-base-starter'],
  // Twoje customizacje
})
```

## 🛠️ Dostosowywanie

### Kolory

Zmień kolory w `app/app.config.ts`:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green', // Zmień na swój kolor
      neutral: 'slate',
    },
  },
})
```

### Komponenty

Wszystkie komponenty są w folderze `app/components/` i można je łatwo modyfikować.

## 📝 Licencja

MIT License - zobacz [LICENSE](LICENSE) dla szczegółów.

## 🤝 Wsparcie

- [Dokumentacja Nuxt](https://nuxt.com/docs)
- [Nuxt UI](https://ui.nuxt.com)
- [Issues](https://github.com/Auriaz/nuxt-base-starter/issues)

## 🙏 Podziękowania

- [Nuxt Team](https://nuxt.com) za świetny framework
- [Nuxt UI](https://ui.nuxt.com) za komponenty UI
- Wszystkim contributorom open source

---

**Zbudowane z ❤️ używając Nuxt 4**
