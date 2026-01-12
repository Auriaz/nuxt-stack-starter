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

# Zainstaluj zależności
npm install
# lub
pnpm install
# lub
bun install
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
npm run dev

# Linting
npm run lint
npm run lint:fix

# Formatowanie
npm run format

# Type checking
npm run typecheck
```

### Production

```bash
# Build
npm run build

# Preview
npm run preview
```

## 🧪 Testy

```bash
# Wszystkie testy
npm run test

# Unit tests
npm run test:unit

# Component tests
npm run test:nuxt

# E2E tests
npm run test:e2e

# E2E tests z UI
npm run test:e2e:ui
```

## 📁 Struktura projektu

```
nuxt-base-starter/
├── app/
│   ├── components/      # Komponenty Vue
│   │   ├── sections/    # Sekcje strony
│   │   ├── ui/          # Komponenty UI
│   │   ├── layout/      # Komponenty layoutu
│   │   └── portfolio/   # Komponenty portfolio
│   ├── composables/     # Composables Vue
│   ├── layouts/         # Layouty
│   ├── pages/           # Strony (file-based routing)
│   ├── server/          # Server API routes
│   ├── assets/          # Zasoby przetwarzane przez Vite
│   │   ├── css/         # Style CSS (main.css)
│   │   └── images/       # Obrazy do importu w komponentach (logo.svg, icons/, illustrations/)
│   └── utils/           # Utility functions
├── content/             # Nuxt Content files
│   └── blog/            # Wpisy bloga
├── public/              # Pliki statyczne (serwowane bezpośrednio)
│   ├── favicon.ico      # Favicon
│   ├── icons/           # Ikony PWA (icon-192x192.png, icon-512x512.png, apple-touch-icon.png)
│   ├── images/          # Obrazy ogólne (og-image.png, logo.png, placeholders/)
│   ├── blog/            # Obrazy bloga (opcjonalnie)
│   ├── portfolio/       # Obrazy portfolio (opcjonalnie)
│   └── documents/       # Dokumenty do pobrania (opcjonalnie)
├── shared/              # Współdzielone typy, schematy i utils
│   ├── types/           # TypeScript types (auto-importowane)
│   │   ├── content.ts   # Typy dla Nuxt Content
│   │   ├── user.ts      # Typy użytkownika/autora
│   │   ├── common.ts    # Wspólne typy (Image, SEO)
│   │   ├── auth.ts      # Typy autoryzacji (przyszłość)
│   │   └── api.ts       # Typy API/DTO (przyszłość)
│   ├── schemas/         # Valibot schemas (walidacja)
│   │   ├── content.ts   # Schematy dla Nuxt Content
│   │   ├── user.ts      # Schematy użytkownika/autora
│   │   ├── common.ts    # Wspólne schematy
│   │   ├── auth.ts      # Schematy autoryzacji
│   │   └── api.ts       # Schematy API
│   └── utils/           # Pure utility functions (auto-importowane)
│       ├── content.ts   # Helpery dla content
│       └── types.ts     # Type guards
├── test/                # Vitest tests
│   ├── unit/            # Unit tests
│   └── nuxt/            # Component tests
├── tests/               # Playwright E2E tests
└── i18n/                # Pliki tłumaczeń
    └── locales/
```

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
