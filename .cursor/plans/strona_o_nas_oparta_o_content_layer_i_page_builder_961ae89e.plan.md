---
name: Strona O nas oparta o Content Layer i Page Builder
overview: Projektowanie i implementacja strony "O nas" w pełni opartej o Content Layer, wykorzystującej PageSchema i system page builder, zgodnie z architekturą używaną w innych stronach (index, oferta).
todos:
  - id: create-about-content
    content: Utworzenie content/o-nas.md z pełną konfiguracją sekcji (hero, features, process, social-proof, cta)
    status: pending
  - id: refactor-about-page
    content: Refaktoryzacja app/pages/o-nas.vue - usunięcie hardcoded contentu, użycie Content Layer i SectionsRenderer
    status: pending
    dependencies:
      - create-about-content
  - id: verify-about-page
    content: Weryfikacja działania strony o-nas z nową konfiguracją - sprawdzenie renderowania wszystkich sekcji
    status: pending
    dependencies:
      - refactor-about-page
  - id: update-documentation
    content: Aktualizacja dokumentacji - dodanie sekcji o stronie O nas (jak edytować bez dotykania kodu)
    status: pending
    dependencies:
      - verify-about-page
---

# Strona O nas oparta o Content Layer i Page Builder

## Analiza obecnego stanu

### Obecna strona o-nas.vue:

- Hardcoded content (hero, misja, wartości, CTA)
- Nie używa Content Layer
- Nie używa page builder
- Nie jest konfigurowalna z plików .md

### Wzorce z innych stron:

- `index.vue` i `oferta.vue` używają: - `queryCollection<PageEntry>('pages').path(path).first()` - `getPageSections(page.value)` do pobrania sekcji - `SectionsRenderer` do renderowania - `useSeoMeta` z danych z page

### Dostępne sekcje w page builder:

- `hero` - sekcja hero z różnymi layoutami
- `social-proof` - logos, stats, testimonials
- `features` - lista funkcji/wartości
- `process` - kroki procesu
- `portfolio` - projekty portfolio
- `faq` - często zadawane pytania
- `cta` - call-to-action
- `pricing` - cennik

## Plan implementacji

### 1. Struktura content

**Plik:** `content/o-nas.md` (nowy)

**Struktura zgodna z PageSchema:**

```yaml
---
title: 'O nas'
description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
to: '/o-nas'
seo:
  title: 'O nas - Nuxt Base Starter'
  description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
  image: '/images/og-image.png'
sections:
  # Sekcje strony
---
```

### 2. Propozycja sekcji dla strony "O nas"

**MVP sekcje (w kolejności):**

1.  **Hero** (`type: 'hero'`)

                                                                                                                                                                                                - Intro / misja firmy
                                                                                                                                                                                                - Layout: `centered` lub `split`
                                                                                                                                                                                                - Może zawierać obraz zespołu/firmy

2.  **Features** (`type: 'features'`)

                                                                                                                                                                                                - Wartości firmy (jakość, innowacyjność, pasja)
                                                                                                                                                                                                - Layout: `grid`, columns: 3
                                                                                                                                                                                                - Variant: `cards` z ikonami

3.  **Process** (`type: 'process'`)

                                                                                                                                                                                                - "Jak pracujemy" - kroki procesu
                                                                                                                                                                                                - Layout: `vertical` lub `timeline`

4.  **Social Proof** (`type: 'social-proof'`)

                                                                                                                                                                                                - Statystyki (liczba projektów, klientów, lat doświadczenia)
                                                                                                                                                                                                - Variant: `stats`

5.  **CTA** (`type: 'cta'`)

                                                                                                                                                                                                - "Chcesz z nami współpracować?"
                                                                                                                                                                                                - Variant: `centered`

**Opcjonalne sekcje (do rozbudowy):**

- **Portfolio** - wyróżnione projekty
- **FAQ** - często zadawane pytania o firmie
- **Social Proof** z `testimonials` - opinie klientów

### 3. Przykładowy content/o-nas.md

**Pełna konfiguracja:**

```yaml
---
title: 'O nas'
description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
to: '/o-nas'
seo:
  title: 'O nas - Nuxt Base Starter'
  description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
  image: '/images/og-image.png'
sections:
  # Hero - Intro / Misja
  - type: 'hero'
    id: 'hero'
    title: 'O nas'
    description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'centered'
      variant: 'primary'
      actions:
        - label: 'Skontaktuj się'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'

  # Features - Wartości firmy
  - type: 'features'
    id: 'values'
    title: 'Nasze wartości'
    description: 'To, co nas wyróżnia i napędza do działania'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'grid'
      columns: 3
      variant: 'cards'
      items:
        - title: 'Skupienie na jakości'
          description: 'Każdy projekt realizujemy z dbałością o szczegóły i najwyższą jakość kodu.'
          icon: 'i-lucide-target'
        - title: 'Innowacyjność'
          description: 'Wykorzystujemy najnowsze technologie i najlepsze praktyki w branży.'
          icon: 'i-lucide-lightbulb'
        - title: 'Pasja'
          description: 'Kochamy to, co robimy i dzielimy się naszą wiedzą z innymi.'
          icon: 'i-lucide-heart'

  # Process - Jak pracujemy
  - type: 'process'
    id: 'process'
    title: 'Jak pracujemy'
    description: 'Nasz proces tworzenia rozwiązań'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'vertical'
      variant: 'default'
      steps:
        - title: 'Analiza potrzeb'
          description: 'Rozmawiamy z klientem, analizujemy wymagania i cele biznesowe.'
          icon: 'i-lucide-search'
          number: 1
        - title: 'Projektowanie'
          description: 'Tworzymy architekturę i projekt rozwiązania dostosowany do potrzeb.'
          icon: 'i-lucide-palette'
          number: 2
        - title: 'Realizacja'
          description: 'Implementujemy rozwiązanie z dbałością o jakość i najlepsze praktyki.'
          icon: 'i-lucide-code'
          number: 3
        - title: 'Wdrożenie i wsparcie'
          description: 'Wdrażamy rozwiązanie i zapewniamy ciągłe wsparcie techniczne.'
          icon: 'i-lucide-rocket'
          number: 4

  # Social Proof - Statystyki
  - type: 'social-proof'
    id: 'stats'
    title: 'Nasze osiągnięcia'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'stats'
      stats:
        - value: '100+'
          label: 'Zrealizowanych projektów'
          icon: 'i-lucide-briefcase'
        - value: '50+'
          label: 'Zadowolonych klientów'
          icon: 'i-lucide-users'
        - value: '5+'
          label: 'Lat doświadczenia'
          icon: 'i-lucide-calendar'

  # CTA - Kontakt
  - type: 'cta'
    id: 'cta'
    title: 'Chcesz z nami współpracować?'
    description: 'Skontaktuj się z nami i dowiedz się, jak możemy pomóc w realizacji Twojego projektu.'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'centered'
      actions:
        - label: 'Skontaktuj się'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'
---
```

### 4. Refaktoryzacja app/pages/o-nas.vue

**Nowa struktura (zgodna z index.vue i oferta.vue):**

```vue
<script setup lang="ts">
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
  import type { PageEntry } from '#shared/types/content'
  import { getPageSections } from '#shared/utils/sections'

  definePageMeta({
    layout: 'default',
  })

  const { path } = useRoute()

  // Pobierz konfigurację strony z content/o-nas.md
  const { data: page } = await useAsyncData('about-page', () =>
    queryCollection<PageEntry>('pages').path(path).first()
  )

  // Pobierz sekcje z page (z fallback do legacy formatu)
  const sections = computed(() => {
    if (!page.value) return []
    return getPageSections(page.value)
  })

  // SEO Meta
  useSeoMeta({
    title: page.value?.seo?.title || page.value?.title || 'O nas',
    description:
      page.value?.seo?.description ||
      page.value?.description ||
      'Poznaj naszą historię, wartości i zespół.',
    ogTitle: page.value?.seo?.title || page.value?.title,
    ogDescription: page.value?.seo?.description || page.value?.description,
    ogImage: page.value?.seo?.image,
    ogType: 'website',
  })
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody>
        <SectionsRenderer :sections="sections" />
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
```

**Zmiany:**

- Usunięcie całego hardcoded contentu
- Pobieranie danych z `queryCollection('pages').path(path).first()`
- Użycie `getPageSections()` do pobrania sekcji
- Renderowanie przez `SectionsRenderer`
- SEO z danych z page (z fallback)

### 5. Integracja z PageSchema

**PageSchema już zawiera:**

- `title: string()` - tytuł strony
- `description: optional(string())` - opis strony
- `to: optional(string())` - ścieżka strony
- `sections: optional(array(any()))` - lista sekcji
- `seo: optional(SEOSchema)` - meta SEO

**Plik `content/o-nas.md` używa:**

- Wszystkich pól z PageSchema
- Nie wymaga rozszerzeń specyficznych dla strony
- Jest w pełni zgodny z istniejącym schematem

### 6. Dokumentacja

**Dodanie sekcji do `docs/PORTFOLIO.md` lub utworzenie `docs/ABOUT_PAGE.md`:**

````markdown
# Strona O nas

## Jak edytować stronę O nas bez dotykania kodu

Strona "O nas" jest w pełni konfigurowalna z pliku `content/o-nas.md`.

### Struktura pliku

Plik `content/o-nas.md` zawiera:

- Frontmatter (YAML) z konfiguracją strony i sekcji
- Opcjonalnie treść markdown (jeśli potrzebna)

### Edycja treści

1. Otwórz `content/o-nas.md`
2. Edytuj frontmatter:
   - `title` - tytuł strony
   - `description` - opis strony
   - `seo` - meta SEO
   - `sections[]` - lista sekcji

### Dodawanie/edycja sekcji

Każda sekcja w `sections[]` ma:

- `type` - typ sekcji (hero, features, process, etc.)
- `id` - unikalny identyfikator
- `title`, `description` - tytuł i opis sekcji
- `props` - specyficzne właściwości sekcji

### Przykład dodania nowej sekcji

```yaml
sections:
  - type: 'features'
    id: 'new-section'
    title: 'Nowa sekcja'
    description: 'Opis nowej sekcji'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'grid'
      columns: 3
      items:
        - title: 'Element 1'
          description: 'Opis elementu 1'
```
````

### Dostępne typy sekcji

- `hero` - sekcja hero
- `features` - lista funkcji/wartości
- `process` - kroki procesu
- `social-proof` - statystyki, logos, testimonials
- `portfolio` - projekty portfolio
- `faq` - często zadawane pytania
- `cta` - call-to-action
- `pricing` - cennik

### SEO

SEO jest konfigurowane w `seo`:

```yaml
seo:
  title: 'O nas - Tytuł SEO'
  description: 'Opis SEO'
  image: '/images/og-image.png'
```

```

## Kolejność wykonania

1. Utworzenie `content/o-nas.md` z pełną konfiguracją sekcji
2. Refaktoryzacja `app/pages/o-nas.vue` - usunięcie hardcoded contentu, użycie Content Layer
3. Weryfikacja działania strony z nową konfiguracją
4. Aktualizacja dokumentacji (dodanie sekcji o stronie O nas)

## Oczekiwane rezultaty

- **100% konfigurowalność** - strona w pełni konfigurowalna z `content/o-nas.md`
- **Spójność architektury** - używa tego samego wzorca co `index.vue` i `oferta.vue`
- **Brak hardcoded contentu** - wszystkie treści pochodzą z Content Layer
- **Elastyczność** - łatwe dodawanie/edycja/usuwanie sekcji bez dotykania kodu
- **SEO** - meta tags z danych content
- **SSR ready** - pełne wsparcie dla SSR

## Diagram przepływu danych

```

content/o-nas.md (PageSchema)

↓

queryCollection('pages').path('/o-nas').first()

↓

getPageSections(page.value)

↓

SectionsRenderer

↓

Komponenty sekcji (SectionsHero, SectionsFeatures, etc.)

```

```
