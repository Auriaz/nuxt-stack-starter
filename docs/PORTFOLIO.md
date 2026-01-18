# Portfolio - Dokumentacja

## Wprowadzenie

System Portfolio w Nuxt Base Starter jest w pełni oparty o Content Layer, co umożliwia łatwe dodawanie i edycję projektów przez pliki markdown. System jest przygotowany na przyszłą autoryzację i integrację z backendem.

## Struktura folderów

```
content/
└── portfolio/
    ├── index.md          # Konfiguracja strony Portfolio (SEO, hero, sections)
    ├── project-1.md     # Przykładowy projekt
    ├── project-2.md     # Kolejne projekty
    └── project-*.md      # Wszystkie projekty portfolio
```

## Jak dodać nowy projekt

### 1. Utwórz plik markdown

Utwórz nowy plik w folderze `content/portfolio/` z nazwą odpowiadającą slugowi projektu, np. `my-awesome-project.md`.

### 2. Wypełnij frontmatter

Każdy projekt musi zawierać następujące pola w frontmatter (YAML):

#### Wymagane pola:

- `title` (string) - Tytuł projektu
- `description` (string) - Krótki opis projektu (używany w liście)
- `coverImage` (object) - Główny obraz projektu
  - `src` (string) - Ścieżka do obrazu
  - `alt` (string) - Tekst alternatywny

#### Opcjonalne pola:

- `slug` (string) - Slug projektu (auto-generowany z nazwy pliku jeśli brak)
- `excerpt` (string) - Dłuższy opis (używany na stronie szczegółowej)
- `tags` (array) - Tagi kategorii (np. 'E-commerce', 'Marketing')
- `technologies` (array) - Technologie użyte w projekcie (np. 'Nuxt', 'Vue', 'TypeScript')
- `year` (string) - Rok realizacji projektu
- `role` (string) - Rola w projekcie (np. 'Full-stack Developer')
- `client` (string) - Nazwa klienta
- `featured` (boolean) - Czy projekt jest wyróżniony (domyślnie: false)
- `status` (string) - Status projektu: 'draft' | 'published' | 'archived' (domyślnie: 'published')
- `publishedAt` (date) - Data publikacji (format: YYYY-MM-DD)
- `seo` (object) - Meta SEO
  - `title` (string) - Tytuł SEO
  - `description` (string) - Opis SEO
  - `image` (string) - Obraz Open Graph
- `gallery` (array) - Galeria obrazów projektu
  - Każdy element: `{ src: string, alt: string }`
- `links` (array) - Linki zewnętrzne
  - `type` (string) - Typ linku: 'live' | 'github' | 'behance' | 'dribbble' | 'figma' | 'other'
  - `label` (string) - Etykieta linku
  - `url` (string) - URL
  - `target` (string) - Target: '\_self' | '\_blank' (opcjonalnie)
- `category` (string) - Kategoria (alias dla pierwszego tagu)

### 3. Przykładowy plik projektu

```yaml
---
title: 'Mój Projekt'
slug: 'my-project'
description: 'Krótki opis projektu'
excerpt: 'Szczegółowy opis projektu...'
coverImage:
  src: '/portfolio/my-project.png'
  alt: 'Mój Projekt'
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
  title: 'Mój Projekt - Portfolio'
  description: 'Krótki opis projektu...'
links:
  - type: 'live'
    label: 'Zobacz live'
    url: 'https://example.com'
    target: '_blank'
  - type: 'github'
    label: 'GitHub'
    url: 'https://github.com/example/project'
gallery:
  - src: '/portfolio/my-project-1.png'
    alt: 'Screenshot 1'
  - src: '/portfolio/my-project-2.png'
    alt: 'Screenshot 2'
---

# Overview

Treść projektu w markdown...

## Problem

Opis problemu...

## Solution

Opis rozwiązania...

## Tech Stack

Lista technologii...

## Result

Rezultaty projektu...
```

## Struktura treści (Case Study)

Treść projektu (po frontmatter) może zawierać sekcje w markdown:

- **Overview** - Wprowadzenie do projektu
- **Problem** - Problem, który projekt rozwiązuje
- **Solution** - Rozwiązanie i podejście
- **Tech Stack** - Użyte technologie
- **Result** - Rezultaty i osiągnięcia

Możesz używać standardowego markdown oraz komponentów Vue (jeśli używasz MDX).

## Filtrowanie i sortowanie

Na stronie listy Portfolio (`/portfolio`) dostępne są następujące opcje:

### Filtry:

- **Tagi** - Filtrowanie po tagach kategorii
- **Technologie** - Filtrowanie po technologiach
- **Rok** - Filtrowanie po roku realizacji

### Sortowanie:

- **Najnowsze** - Sortowanie po dacie publikacji (domyślnie)
- **Najstarsze** - Sortowanie odwrotne
- **Wyróżnione** - Projekty z `featured: true` na początku

## Statusy projektów

- `published` - Projekt jest widoczny publicznie (domyślnie)
- `draft` - Projekt w trakcie przygotowania (niewidoczny publicznie)
- `archived` - Projekt zarchiwizowany (niewidoczny publicznie)

**Uwaga:** Tylko projekty ze statusem `published` są wyświetlane na stronie listy.

## Przygotowanie pod autoryzację

System jest przygotowany na przyszłą autoryzację:

1. **Status `draft`** - Projekty ze statusem `draft` nie są wyświetlane publicznie, ale mogą być dostępne dla zalogowanych użytkowników
2. **Abstrakcja warstwy danych** - Funkcje w `shared/utils/portfolio.ts` mogą być łatwo zastąpione przez API calls
3. **Struktura danych** - Struktura danych pozostaje identyczna niezależnie od źródła (Content Layer lub API)

## Komponenty

### PortfolioCard

Wyświetla pojedynczy projekt w formie karty. Używany w gridzie projektów i sekcji Portfolio.

**Props:**

- `project` (PortfolioCardProps) - Projekt do wyświetlenia (stabilny kontrakt danych, niezależny od content layer)

**Uwaga:** Komponent jest czysto prezentacyjny i nie zależy od struktury content layer.

### PortfolioGrid

Wyświetla grid projektów z filtrami i sortowaniem.

**Props:**

- `projects` (PortfolioCardProps[]) - Lista projektów
- `showFilters` (boolean) - Czy pokazać filtry (domyślnie: true)
- `layout` ('grid' | 'masonry') - Layout gridu (domyślnie: 'grid')

### PortfolioHero

Wyświetla hero sekcję na stronie szczegółowej projektu.

**Props:**

- `project` (PortfolioProjectEntry) - Projekt do wyświetlenia

## Strony

### `/portfolio`

Strona listy wszystkich projektów portfolio. Używa page builder do konfiguracji sekcji (hero, etc.) i wyświetla grid projektów z filtrami.

**Używa:**

- `usePortfolioContent()` composable do pobierania projektów
- `PortfolioGrid` do wyświetlania z filtrami
- `PortfolioCard` do renderowania pojedynczych projektów

### `/portfolio/[slug]`

Strona szczegółowa pojedynczego projektu (case study). Wyświetla:

- Hero z coverImage, title, description
- Meta informacje (year, role, client, technologies)
- Linki zewnętrzne (live, github, etc.)
- Treść markdown
- Galerię obrazów
- CTA sekcję

## Sekcja Portfolio w Page Builder

Sekcja Portfolio może być używana na dowolnej stronie (home, usługi, etc.) jako blok wyświetlający projekty.

### Konfiguracja w content

```yaml
sections:
  - type: 'portfolio'
    id: 'portfolio-section'
    title: 'Nasze projekty'
    description: 'Zobacz nasze realizacje'
    align: 'center'
    props:
      limit: 6 # Limit liczby projektów
      showFeaturedOnly: false # Tylko wyróżnione projekty
      filterByTags: ['E-commerce'] # Filtrowanie po tagach
      filterByTechnologies: ['Nuxt'] # Filtrowanie po technologiach
      filterByYear: '2024' # Filtrowanie po roku
      sortBy: 'newest' # Sortowanie: newest | oldest | featured
      layout: 'grid' # Layout: grid | masonry | carousel
      columns: 3 # Liczba kolumn: 2 | 3 | 4
```

### Opcje konfiguracji

- **limit** (number) - Maksymalna liczba projektów do wyświetlenia
- **showFeaturedOnly** (boolean) - Jeśli `true`, wyświetla tylko projekty z `featured: true`
- **filterByTags** (string[]) - Filtruje projekty po tagach kategorii
- **filterByTechnologies** (string[]) - Filtruje projekty po technologiach
- **filterByYear** (string) - Filtruje projekty po roku realizacji
- **sortBy** ('newest' | 'oldest' | 'featured') - Sposób sortowania projektów
- **layout** ('grid' | 'masonry' | 'carousel') - Layout wyświetlania (carousel w przyszłości)
- **columns** (2 | 3 | 4) - Liczba kolumn w gridzie

### Przykład użycia

**content/index.md:**

```yaml
sections:
  - type: 'hero'
    # ... hero config
  - type: 'portfolio'
    id: 'featured-projects'
    title: 'Wyróżnione projekty'
    description: 'Zobacz nasze najlepsze realizacje'
    align: 'center'
    props:
      limit: 3
      showFeaturedOnly: true
      sortBy: 'featured'
      layout: 'grid'
      columns: 3
  - type: 'cta'
    # ... cta config
```

## Architektura danych

### Single Source of Truth

Wszystkie dane portfolio pochodzą z `content/portfolio/*.md` - jest to jedyne źródło danych.

### Warstwy abstrakcji

```
content/portfolio/*.md
  ↓
shared/utils/portfolio.ts (getPortfolioProjects)
  ↓
app/composables/usePortfolioContent.ts (composable - adapter)
  ↓ (mapowanie PortfolioProjectEntry → PortfolioCardProps)
  ↓
SectionsPortfolio.vue → PortfolioCard
app/pages/portfolio/index.vue → PortfolioGrid → PortfolioCard
```

### Kontrakt danych

**PortfolioCardProps** - stabilny interfejs dla UI komponentów:

- Nie zależy od struktury content layer
- Może być łatwo zastąpione przez API w przyszłości
- Używany przez wszystkie komponenty prezentacyjne

### Gotowość na API

W przyszłości `usePortfolioContent` może być łatwo zastąpione przez API call bez zmian w komponentach:

- `PortfolioCard` nie wymaga zmian
- `SectionsPortfolio` nie wymaga zmian
- `PortfolioGrid` nie wymaga zmian
- Tylko `usePortfolioContent` wymaga modyfikacji

## SEO i Schema.org

Każdy projekt automatycznie generuje:

- Meta tags (title, description, og:image)
- Schema.org CreativeWork dla lepszego SEO

## Przykłady użycia

### Pobieranie projektów w komponencie

```typescript
import { getPortfolioProjects } from '#shared/utils/portfolio'

const { data: projects } = await useAsyncData('portfolio', () =>
  getPortfolioProjects({
    status: 'published',
    featured: true,
  })
)
```

### Pobieranie pojedynczego projektu

```typescript
import { getPortfolioProject } from '#shared/utils/portfolio'

const { data: project } = await useAsyncData('project', () =>
  getPortfolioProject('my-project-slug')
)
```

## Wskazówki

1. **Obrazy** - Umieść obrazy w folderze `public/portfolio/` i używaj ścieżek względnych (`/portfolio/image.png`)
2. **Slug** - Jeśli nie podasz `slug` w frontmatter, zostanie wygenerowany z nazwy pliku
3. **Status** - Zawsze ustaw `status: 'published'` dla projektów gotowych do publikacji
4. **Featured** - Użyj `featured: true` dla najważniejszych projektów
5. **Technologie** - Wypełnij `technologies` aby umożliwić filtrowanie po technologiach

## Rozwiązywanie problemów

### Projekt nie wyświetla się na liście

- Sprawdź czy `status: 'published'` jest ustawione
- Sprawdź czy plik jest w folderze `content/portfolio/`
- Sprawdź czy frontmatter jest poprawnie sformatowany (YAML)

### Błąd walidacji schematu

- Sprawdź czy wszystkie wymagane pola są wypełnione
- Sprawdź typy danych (np. `tags` musi być array)
- Sprawdź czy `coverImage` ma `src` i `alt`

### Obrazy nie wyświetlają się

- Sprawdź czy obrazy są w folderze `public/portfolio/`
- Sprawdź czy ścieżki są poprawne (zaczynają się od `/`)
- Sprawdź czy obrazy istnieją w systemie plików
