---
name: Trzy posty blogowe o Nuxt 4
overview: Zaplanowanie trzech rzetelnych postów blogowych na temat Nuxt 4, opartych na oficjalnej dokumentacji z nuxt.com. Każdy post będzie miał kompletną strukturę frontmatter zgodną z BlogPostSchema i wartościową treść edukacyjną.
todos:
  - id: post1-create
    content: 'Utworzyć post 1: Auto-imports w Nuxt 4 (content/blog/auto-imports-nuxt-4.md) z pełnym frontmatter i treścią'
    status: completed
  - id: post2-create
    content: 'Utworzyć post 2: Nitro - Silnik serwerowy (content/blog/nitro-server-engine.md) z pełnym frontmatter i treścią'
    status: completed
  - id: post3-create
    content: 'Utworzyć post 3: Strategie renderowania (content/blog/rendering-strategies-nuxt-4.md) z pełnym frontmatter i treścią'
    status: completed
  - id: verify-schema
    content: Zweryfikować, że wszystkie posty są zgodne z BlogPostSchema
    status: completed
  - id: verify-content
    content: Sprawdzić rzetelność informacji - wszystkie fakty oparte na dokumentacji Nuxt
    status: completed
---

# Plan: Trzy posty blogowe o Nuxt 4

## Cel

Stworzenie trzech wartościowych postów edukacyjnych na temat Nuxt 4, opartych na oficjalnej dokumentacji z nuxt.com. Posty będą różnorodne tematycznie i pokryją kluczowe funkcje frameworka.

## Struktura każdego posta

Każdy post będzie zgodny z `BlogPostSchema` z `shared/schemas/content.ts`:

- `title` (string) - tytuł posta
- `description` (string) - krótki opis
- `date` (date) - data publikacji
- `image` (ImageSchema) - obraz z `src` i `alt`
- `authors` (array AuthorSchema) - autorzy
- `tags` (array string) - tagi
- `seo` (SEOSchema) - meta SEO
- `to` (string) - ścieżka do posta

## Post 1: Auto-imports w Nuxt 4

**Tytuł:** "Auto-imports w Nuxt 4 - Magia automatycznych importów"

**Opis:** "Poznaj jak Nuxt 4 automatycznie importuje komponenty, composables i utilities, eliminując potrzebę ręcznych importów i poprawiając Developer Experience."

**Tematyka:**

- Jak działają auto-imports w Nuxt 4
- Katalogi auto-importowane (composables, components, utils)
- Konfiguracja auto-imports w `nuxt.config.ts`
- TypeScript support dla auto-imports
- Best practices i optymalizacja
- Przykłady użycia

**Źródła:**

- `/docs/4.x/guide/concepts/auto-imports`
- `/docs/4.x/getting-started/introduction` (sekcja Automation and Conventions)

**Tagi:** `['Nuxt', 'Auto-imports', 'Developer Experience', 'TypeScript', 'Vue 3']`

**Data:** 2025-01-20

**Ścieżka:** `/blog/auto-imports-nuxt-4`

## Post 2: Nitro - Silnik serwerowy Nuxt

**Tytuł:** "Nitro - Silnik serwerowy Nuxt, który zmienia zasady gry"

**Opis:** "Odkryj Nitro - nowoczesny silnik serwerowy Nuxt, który umożliwia deployment wszędzie: Node.js, serverless, edge i statyczne hostingi."

**Tematyka:**

- Czym jest Nitro i dlaczego został stworzony
- API Layer - server routes i middleware
- Direct API Calls - `$fetch` i optymalizacja
- Typed API Routes - wsparcie TypeScript
- Standalone Server - niezależny output
- Deployment options (Node.js, serverless, edge, static)
- Przykłady użycia

**Źródła:**

- `/docs/4.x/guide/concepts/server-engine`
- `/docs/4.x/getting-started/introduction` (sekcja Server engine)

**Tagi:** `['Nuxt', 'Nitro', 'Server Engine', 'Full-Stack', 'Deployment', 'API']`

**Data:** 2025-01-25

**Ścieżka:** `/blog/nitro-server-engine`

## Post 3: Strategie renderowania w Nuxt 4

**Tytuł:** "Strategie renderowania w Nuxt 4 - SSR, SSG i Hybrid Rendering"

**Opis:** "Zrozum różne strategie renderowania w Nuxt 4: Server-Side Rendering, Static Site Generation i Hybrid Rendering. Dowiedz się, kiedy użyć której strategii."

**Tematyka:**

- Server-Side Rendering (SSR) - domyślny tryb
- Static Site Generation (SSG) - `nuxt generate`
- Hybrid Rendering - `routeRules` dla różnych stron
- Korzyści każdej strategii (SEO, performance, UX)
- Konfiguracja `routeRules` w `nuxt.config.ts`
- Przykłady użycia dla różnych scenariuszy
- Best practices wyboru strategii

**Źródła:**

- `/docs/4.x/guide/concepts/rendering`
- `/docs/4.x/getting-started/introduction` (sekcja Server-Side Rendering)

**Tagi:** `['Nuxt', 'SSR', 'SSG', 'Rendering', 'SEO', 'Performance']`

**Data:** 2025-01-30

**Ścieżka:** `/blog/rendering-strategies-nuxt-4`

## Struktura plików

Posty będą utworzone w:

- `content/blog/auto-imports-nuxt-4.md`
- `content/blog/nitro-server-engine.md`
- `content/blog/rendering-strategies-nuxt-4.md`

## Szczegóły implementacji

### Frontmatter template

Każdy post będzie miał strukturę:

```yaml
---
title: 'Tytuł posta'
description: 'Krótki opis posta'
date: 2025-01-XX
image:
  src: '/blog/nazwa-postu.jpg'
  alt: 'Opis obrazu'
tags:
  - 'Nuxt'
  - 'Temat 1'
  - 'Temat 2'
authors:
  - name: 'Zespół Nuxt Base Starter'
    avatar:
      src: 'https://github.com/antfu.png'
      alt: 'Zespół Nuxt Base Starter'
    description: 'Zespół Nuxt Base Starter'
    to: '/blog/'
    target: '_blank'
seo:
  title: 'Tytuł SEO - może być dłuższy'
  description: 'Opis SEO dla wyszukiwarek'
  ogType: 'article'
to: '/blog/nazwa-postu'
---
```

### Treść postów

Każdy post będzie zawierał:

1. Wprowadzenie - krótkie wprowadzenie do tematu
2. Główną sekcję - szczegółowe wyjaśnienie z przykładami kodu
3. Praktyczne przykłady - kod pokazujący użycie
4. Best practices - rekomendacje i dobre praktyki
5. Podsumowanie - zwięzłe podsumowanie i linki do dokumentacji

### Obrazy

Obrazy będą w formacie placeholder (do późniejszej wymiany):

- `/blog/auto-imports-nuxt-4.jpg`
- `/blog/nitro-server-engine.jpg`
- `/blog/rendering-strategies-nuxt-4.jpg`

Obrazy będą umieszczone w `public/blog/` zgodnie ze strukturą katalogów.

## Weryfikacja

Po utworzeniu postów należy sprawdzić:

- Zgodność z `BlogPostSchema`
- Poprawność frontmatter (wszystkie wymagane pola)
- Poprawność ścieżek obrazów
- Poprawność dat (kolejność chronologiczna)
- Rzetelność informacji (oparte na dokumentacji Nuxt)

## Uwagi

- Wszystkie informacje będą oparte na oficjalnej dokumentacji Nuxt 4
- Przykłady kodu będą praktyczne i działające
- Posty będą miały edukacyjny charakter
- Każdy post będzie samodzielny, ale może nawiązywać do innych
- Język: polski (zgodnie z konfiguracją i18n)
