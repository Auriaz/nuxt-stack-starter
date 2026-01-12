---
name: Nuxt Base Starter - Plan Wdrożenia
overview: Kompleksowy plan stworzenia publicznego startera Nuxt 4 jako "wersji podstawowej" (Base Starter) - solidnej podkładki pod strony internetowe z gotowymi podstronami, layoutami, SEO baseline i zestawem modułów skonfigurowanych produkcyjnie.
todos:
  - id: step1-config
    content: 'KROK 1: Przygotowanie struktury i konfiguracji podstawowej - zweryfikować nuxt.config.ts, dodać konfigurację i18n i SEO, routeRules, robots.txt'
    status: completed
  - id: step2-layouts
    content: 'KROK 2: Layouty i komponenty layoutu - zweryfikować Header, Footer, Navbar, dodać responsywność i dark mode'
    status: completed
  - id: step3-home
    content: 'KROK 3: Strona główna (Home) - stworzyć sekcje Hero, Features, Testimonials, CTA, zaktualizować index.vue'
    status: completed
  - id: step4-pages
    content: 'KROK 4: Podstrony statyczne - stworzyć /oferta, /portfolio, /o-nas z odpowiednimi komponentami (Pricing, PortfolioCard, FAQ)'
    status: completed
  - id: step5-contact
    content: 'KROK 5: Strona kontaktowa z formularzem - stworzyć kontakt.vue, useForm composable, API endpoint contact.post.ts'
    status: completed
  - id: step6-blog
    content: 'KROK 6: Blog - zweryfikować istniejące strony bloga, zaktualizować content.config.ts, dodać przykładowy wpis'
    status: completed
  - id: step7-seo
    content: 'KROK 7: SEO Baseline - stworzyć useSeo composable, zweryfikować sitemap.xml, robots.txt, OpenGraph, canonical URLs'
    status: completed
  - id: step8-tests
    content: 'KROK 8: Testy - dodać przykładowe testy unit, component i E2E, zweryfikować konfigurację'
    status: completed
  - id: step9-integrations
    content: 'KROK 9: Integracje opcjonalne - dodać konfigurację Plausible Analytics, .env.example'
    status: completed
  - id: step10-docs
    content: 'KROK 10: Dokumentacja i finalizacja - zaktualizować README.md, dodać LICENSE, final code review'
    status: completed
---

# Plan Wdrożenia: Nuxt Base Starter

## 1. PROPOZYCJE NAZW REPOZYTORIUM

### Opcja 1: `nuxt-base-starter` ⭐ (REKOMENDOWANA)

- **Uzasadnienie**: Prosta, jasna nazwa wskazująca na "bazowy starter"
- **Zalety**: Łatwa do zapamiętania, SEO-friendly, uniwersalna
- **Format**: `@Auriaz/nuxt-base-starter`

### Opcja 2: `nuxt-foundation`

- **Uzasadnienie**: "Foundation" = fundament, podstawa
- **Zalety**: Krótka, profesjonalna, sugeruje solidność
- **Format**: `@Auriaz/nuxt-foundation`

### Opcja 3: `nuxt-core-starter`

- **Uzasadnienie**: "Core" = rdzeń, esencja
- **Zalety**: Wskazuje na minimalną, ale kompletną bazę
- **Format**: `@Auriaz/nuxt-core-starter`

### Opcja 4: `nuxt-web-foundation`

- **Uzasadnienie**: "Web Foundation" = fundament dla stron WWW
- **Zalety**: Bardzo opisowa, jasno określa cel
- **Format**: `@Auriaz/nuxt-web-foundation`

### Opcja 5: `nuxt-starter-base`

- **Uzasadnienie**: Odwrócona kolejność - "starter-base"
- **Zalety**: Spójna z konwencją "base" na końcu
- **Format**: `@Auriaz/nuxt-starter-base`

**Rekomendacja**: `nuxt-base-starter` - najlepsza równowaga między prostotą a opisowością.

---

## 2. ARCHITEKTURA REPOZYTORIUM

### Struktura folderów (finalna)

```
nuxt-base-starter/
├── .cursor/                    # Plany i dokumentacja wewnętrzna
├── .github/
│   └── workflows/
│       └── ci.yml              # CI/CD pipeline
├── .husky/                     # Git hooks (commitlint, lint-staged)
├── .vscode/                    # VS Code settings
├── app/
│   ├── assets/
│   │   └── css/
│   │       └── main.css        # Globalne style (Tailwind + custom)
│   ├── components/
│   │   ├── sections/           # Sekcje strony (Hero, Features, etc.)
│   │   │   ├── Hero/
│   │   │   ├── Features/
│   │   │   ├── Pricing/
│   │   │   ├── Testimonials/
│   │   │   └── FAQ/
│   │   ├── ui/                 # Podstawowe komponenty UI
│   │   │   ├── CTA/
│   │   │   └── Card/
│   │   ├── layout/             # Komponenty layoutu
│   │   │   ├── Header/
│   │   │   ├── Footer/
│   │   │   └── Navbar/
│   │   ├── blog/               # Komponenty bloga (opcjonalnie)
│   │   │   ├── BlogPostCard/
│   │   │   └── BlogList/
│   │   └── portfolio/          # Komponenty portfolio
│   │       └── PortfolioCard/
│   ├── composables/            # Composables Vue
│   │   ├── useSeo.ts           # SEO helpers
│   │   └── useForm.ts          # Form handling
│   ├── layouts/
│   │   ├── default.vue         # Główny layout (Header + Footer)
│   │   └── guest.vue           # Layout bez Header/Footer (opcjonalnie)
│   ├── middleware/              # Middleware Nuxt
│   │   └── seo.ts               # SEO middleware (canonical, etc.)
│   ├── pages/
│   │   ├── index.vue           # Home (/)
│   │   ├── oferta.vue          # Oferta (/oferta)
│   │   ├── portfolio/
│   │   │   └── index.vue       # Portfolio (/portfolio)
│   │   ├── o-nas.vue           # O nas (/o-nas)
│   │   ├── kontakt.vue         # Kontakt z formularzem (/kontakt)
│   │   └── blog/               # Blog (opcjonalnie w bazie)
│   │       ├── index.vue
│   │       └── [slug].vue
│   ├── utils/                  # Utility functions
│   │   ├── seo.ts              # SEO utilities
│   │   └── form.ts             # Form validation
│   ├── app.config.ts           # App config (Nuxt UI colors, etc.)
│   └── app.vue                 # Root component
|   |__ error.vue               # Error component
├── content/                    # Nuxt Content
│   ├── blog/                   # Wpisy bloga (jeśli w bazie)
│   │   └── welcome.md
│   └── pages/                  # Content pages (opcjonalnie)
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── og-image.png            # Domyślny OG image
├── server/
│   ├── api/
│   │   └── contact.post.ts # API endpoint dla formularza kontaktowego
│   └── middleware/
│       └── sw-handler.ts   # Service Worker handler
├── tests/                      # Playwright E2E tests
│   ├── pages/
│   │   ├── home.spec.ts
│   │   └── contact.spec.ts
│   └── example.spec.ts
├── test/                       # Vitest tests
│   ├── unit/                   # Unit tests
│   │   └── utils/
│   │       └── seo.test.ts
│   └── nuxt/                   # Nuxt component tests
│       └── components/
│           └── Hero.test.ts
├── i18n/                       # Pliki tłumaczeń (opcjonalnie)
│   └── locales/
│       ├── pl.json
│       └── en.json
├── .editorconfig
├── .gitignore
├── .npmrc
├── .nuxtrc
├── .prettierrc
├── commitlint.config.cjs
├── eslint.config.mjs
├── nuxt.config.ts              # Główna konfiguracja Nuxt
├── package.json
├── playwright.config.ts
├── vitest.config.ts
├── tsconfig.json
├── README.md                   # Dokumentacja startera
└── LICENSE                     # MIT License (rekomendowane)
```

## Nazwy komponentów

Jeśli masz komponent w zagnieżdżonych katalogach, takich jak:

Struktura katalogu

```
-| components/
---| base/
-----| foo/
-------| Button.vue

```

. ... wówczas nazwa komponentu będzie oparta na jego własnym katalogu ścieżek i nazwie pliku, a zduplikowane segmenty zostaną usunięte. Dlatego nazwa komponentu będzie wyglądać następująco:

```
<BaseFooButton />

```

Dla przejrzystości zalecamy, aby nazwa pliku komponentu odpowiadała jego nazwie. Tak więc w powyższym przykładzie możesz zmienić nazwę `Button.vue` być `BaseFooButton.vue`.

Jeśli chcesz automatycznie importować komponenty tylko na podstawie ich nazwy, a nie ścieżki, musisz ustawić `pathPrefix` opcja do `false` używając rozszerzonej formy obiektu konfiguracji:

nuxt.config.ts

```
export default defineNuxtConfig({
  components: [
    {
      path: '~/components',
      pathPrefix: false,    },
  ],
})

```

Rejestruje to komponenty przy użyciu tej samej strategii, która jest stosowana w Nuxt 2. Na przykład, `~/components/Some/MyComponent.vue` będzie użyteczny jako `<MyComponent>` i nie `<SomeMyComponent>`.

### Zasady organizacji komponentów

1. **Komponenty sekcji** (`app/components/sections/`) - duże, samodzielne sekcje strony
2. **Komponenty UI** (`app/components/ui/`) - małe, wielokrotnego użytku komponenty
3. **Komponenty layoutu** (`app/components/layout/`) - Header, Footer, Navbar
4. **Komponenty domenowe** (`app/components/blog/`, `app/components/portfolio/`) - specyficzne dla domeny

---

## 3. LISTA DECYZJI TECHNICZNYCH I KONFIGURACYJNYCH

### 3.1. Nuxt 4 - Konfiguracja podstawowa

```typescript
// nuxt.config.ts - fragmenty kluczowe

export default defineNuxtConfig({
  compatibilityDate: '2025-01-15',

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/a11y',
    '@nuxt/content',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@nuxtjs/seo',
  ],

  // SSG jako domyślna strategia renderowania
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },

  routeRules: {
    // Statyczne strony - SSG
    '/': { prerender: true },
    '/oferta': { prerender: true },
    '/portfolio': { prerender: true },
    '/o-nas': { prerender: true },
    '/kontakt': { ssr: true }, // Formularz wymaga SSR
    '/blog/**': { prerender: true }, // Jeśli blog w bazie
  },

  // SEO - automatyczne przez @nuxtjs/seo
  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    name: 'Base Starter',
    description: 'Nuxt Base Starter - solid foundation for web projects',
    defaultLocale: 'pl',
  },
})
```

**Decyzje**:

- **SSG jako domyślne** - strony publiczne są statyczne (szybkość, SEO)
- **SSR dla `/kontakt`** - formularz wymaga serwera
- **Hybrid rendering** - możliwość rozszerzenia w przyszłości

### 3.2. Nuxt UI + Tailwind

**Decyzja**: **TAK - używamy Tailwind razem z Nuxt UI**

**Uzasadnienie**:

- Nuxt UI 4 jest zbudowany na Tailwind CSS v4
- Tailwind jest wymagany i automatycznie konfigurowany przez Nuxt UI
- Nie ma konfliktu - to naturalna kombinacja
- Pozwala na customizację przez `@theme` directive (Tailwind v4)

**Konfiguracja**:

```css
/* app/assets/css/main.css */
@import 'tailwindcss';
@import '@nuxt/ui';

@theme static {
  --font-sans: 'Inter', system-ui, sans-serif;
  /* Custom colors, spacing, etc. */
}
```

### 3.3. Nuxt Content - Konfiguracja

**Decyzja**: **Blog w bazie startera (opcjonalny, ale gotowy)**

**Uzasadnienie**:

- Blog jest częstym wymaganiem
- Łatwo usunąć jeśli niepotrzebny
- Pokazuje jak używać Nuxt Content w praktyce

**Konfiguracja**:

```typescript
// content.config.ts
export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'date', type: 'date', required: true },
        { name: 'image', type: 'string' },
        { name: 'authors', type: 'object' },
      ],
    }),
  },
})
```

**Nuxt Studio**: **OPCJONALNIE - tylko jeśli planujesz CMS**

- Warto dodać jeśli starter ma być używany przez non-technical users
- Jeśli nie - pominąć (dodatkowa złożoność)

### 3.4. i18n - Konfiguracja

**Decyzja**: **Podstawowa konfiguracja PL/EN**

```typescript
// nuxt.config.ts
i18n: {
  locales: [
    { code: 'pl', iso: 'pl-PL', file: 'pl.json', name: 'Polski' },
    { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' }
  ],
  defaultLocale: 'pl',
  strategy: 'prefix_except_default', // /oferta (PL), /en/offer (EN)
  langDir: 'i18n/locales',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected'
  }
}
```

**Uzasadnienie**:

- `prefix_except_default` - PL bez prefiksu (SEO-friendly dla polskiego rynku)
- Cookie-based detection - lepsze UX

### 3.5. SEO Baseline - Konfiguracja

**Moduł**: `@nuxtjs/seo` (automatycznie obsługuje większość)

**Dodatkowe pliki**:

- `public/robots.txt` - ręcznie lub przez moduł
- `public/sitemap.xml` - generowany automatycznie przez `@nuxtjs/seo`
- RSS feed - przez `@nuxt/content` (jeśli blog w bazie)

**Przykładowy composable**:

```typescript
// app/composables/useSeo.ts
export const usePageSeo = (meta: {
  title: string
  description: string
  image?: string
  noindex?: boolean
}) => {
  const siteUrl = useRuntimeConfig().public.siteUrl

  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogImage: meta.image || `${siteUrl}/og-image.png`,
    twitterCard: 'summary_large_image',
    robots: meta.noindex ? 'noindex,nofollow' : 'index,follow',
  })

  useHead({
    link: [{ rel: 'canonical', href: `${siteUrl}${useRoute().path}` }],
  })
}
```

### 3.6. Testy - Konfiguracja

**Decyzje**:

- **Vitest** - unit + component tests
- **Runtime**: `happy-dom` (szybszy niż jsdom, zgodny z preferencjami)
- **E2E**: Playwright (już skonfigurowany)
- **Coverage**: **NIE na start** - dodamy później jeśli potrzeba

**Uzasadnienie coverage**:

- Starter ma być prosty i łatwy do utrzymania
- Coverage dodaje złożoność CI/CD
- Można dodać później jako opcję

**Struktura testów**:

```
test/
├── unit/           # Pure functions, utilities
├── nuxt/           # Component tests (happy-dom)
tests/              # E2E tests (Playwright)
```

### 3.7. Integracje - Plausible Analytics

**Decyzja**: **Gotowa konfiguracja, ale opcjonalna**

```typescript
// nuxt.config.ts
scripts: {
  // Plausible - privacy-first analytics
  register: [
    {
      name: 'plausible',
      src: 'https://plausible.io/js/script.js',
      'data-domain': process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
      defer: true,
      // Load only if domain is set
      ...(process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN ? {} : { skip: true }),
    },
  ]
}
```

**Cookie Banner**: **NIE na start**

- Plausible nie wymaga zgody (GDPR-friendly)
- Jeśli dodamy Google Analytics później - wtedy cookie banner
- Minimalna implementacja: prosty composable `useCookieConsent()`

---

## 4. PLAN WDROŻENIA KROK PO KROKU

### KROK 1: Przygotowanie struktury i konfiguracji podstawowej

**Cel**: Działający Nuxt 4 z wszystkimi modułami

**Zadania**:

1. ✅ Zweryfikować `nuxt.config.ts` - wszystkie moduły na liście
2. ✅ Skonfigurować `@nuxtjs/i18n` (obecnie brak konfiguracji)
3. ✅ Dodać `@nuxtjs/seo` konfigurację (site.url, site.name)
4. ✅ Skonfigurować `routeRules` dla SSG/SSR
5. ✅ Dodać `public/robots.txt` (podstawowy)
6. ✅ Zweryfikować `vitest.config.ts` i `playwright.config.ts`

**Definition of Done**:

- `npm run dev` działa bez błędów
- Wszystkie moduły załadowane
- TypeScript bez błędów

---

### KROK 2: Layouty i komponenty layoutu

**Cel**: Działający Header, Footer, Navbar

**Zadania**:

1. ✅ Zweryfikować `app/layouts/default.vue`
2. ✅ Upewnić się że `Header`, `Footer`, `Navbar` są kompletne
3. ✅ Dodać responsywność (mobile menu)
4. ✅ Dodać dark mode toggle (jeśli nie ma)
5. ✅ Stylować zgodnie z Nuxt UI design system

**Definition of Done**:

- Layout renderuje się poprawnie
- Mobile menu działa
- Dark mode działa
- Brak błędów w konsoli

---

### KROK 3: Strona główna (Home)

**Cel**: Kompletna strona `/` z sekcjami

**Zadania**:

1. Stworzyć `app/components/sections/Hero/Hero.vue`
2. Stworzyć `app/components/sections/Features/Features.vue`
3. Stworzyć `app/components/sections/Testimonials/Testimonials.vue` (opcjonalnie)
4. Stworzyć `app/components/ui/CTA/CTA.vue`
5. Zaktualizować `app/pages/index.vue` - użyć sekcji
6. Dodać SEO meta dla home

**Definition of Done**:

- Strona `/` renderuje wszystkie sekcje
- Responsywna na mobile/tablet/desktop
- SEO meta poprawne (title, description, OG)

---

### KROK 4: Podstrony statyczne

**Cel**: Wszystkie wymagane podstrony działają

**Zadania**:

1. Stworzyć `app/pages/oferta.vue` (lub `/services` - zdecydować o nazewnictwie)
2. Stworzyć `app/pages/portfolio/index.vue` + `app/components/portfolio/PortfolioCard.vue`
3. Stworzyć `app/pages/o-nas.vue`
4. Dodać `app/components/sections/Pricing/Pricing.vue` (dla oferty)
5. Dodać `app/components/sections/FAQ/FAQ.vue` (opcjonalnie)
6. Dodać SEO meta dla każdej strony

**Decyzja nazewnictwa**: **Polskie ścieżki** (`/oferta`, `/o-nas`, `/kontakt`)

- Lepsze SEO dla polskiego rynku
- Spójne z `defaultLocale: 'pl'`
- Angielskie wersje przez i18n: `/en/services`, `/en/about`, `/en/contact`

**Definition of Done**:

- Wszystkie podstrony dostępne i renderują się
- SEO meta poprawne
- Linki w nawigacji działają

---

### KROK 5: Strona kontaktowa z formularzem

**Cel**: Działający formularz kontaktowy z walidacją

**Zadania**:

1. Stworzyć `app/pages/kontakt.vue`
2. Stworzyć `app/composables/useForm.ts` - form handling + walidacja
3. Stworzyć `app/server/api/contact.post.ts` - endpoint API
4. Dodać walidację po stronie klienta (Nuxt UI form components)
5. Dodać obsługę błędów i success state
6. Dodać SEO meta

**Przykładowa struktura formularza**:

```vue
<!-- app/pages/kontakt.vue -->
<template>
  <NuxtLayout>
    <UForm :schema="schema" :state="state" @submit="onSubmit">
      <UFormGroup label="Imię i nazwisko" name="name">
        <UInput v-model="state.name" />
      </UFormGroup>
      <!-- ... -->
    </UForm>
  </NuxtLayout>
</template>
```

**Definition of Done**:

- Formularz wysyła dane do API
- Walidacja działa (client-side)
- Success/error messages wyświetlane
- SEO meta poprawne

---

### KROK 6: Blog (jeśli w bazie)

**Cel**: Działający blog z Nuxt Content

**Zadania**:

1. ✅ Zweryfikować `app/pages/blog/index.vue` (już istnieje)
2. ✅ Zweryfikować `app/pages/blog/[slug].vue` (już istnieje)
3. Zaktualizować `content.config.ts` - dodać kolekcję `blog`
4. Dodać przykładowy wpis `content/blog/welcome.md`
5. Stworzyć `app/components/blog/BlogPostCard.vue` (jeśli nie ma)
6. Dodać RSS feed (automatycznie przez `@nuxt/content`)
7. Dodać SEO meta dla bloga

**Definition of Done**:

- Lista wpisów renderuje się na `/blog`
- Pojedynczy wpis renderuje się na `/blog/[slug]`
- RSS feed dostępny
- SEO meta poprawne

---

### KROK 7: SEO Baseline - finalizacja

**Cel**: Wszystkie elementy SEO działają

**Zadania**:

1. Dodać `app/composables/useSeo.ts` - helper dla SEO meta
2. Użyć `useSeo` na wszystkich stronach
3. Zweryfikować `sitemap.xml` (generowany przez `@nuxtjs/seo`)
4. Zaktualizować `public/robots.txt`
5. Dodać canonical URLs (automatycznie przez `@nuxtjs/seo`)
6. Dodać OpenGraph images (domyślny + per-page)
7. Zweryfikować strukturę nagłówków (h1-h6) dla a11y

**Definition of Done**:

- Wszystkie strony mają poprawne meta tags
- `sitemap.xml` generowany i dostępny
- `robots.txt` poprawny
- OpenGraph działa (można zweryfikować przez ogp.me)
- Struktura nagłówków semantyczna

---

### KROK 8: Testy - podstawowa konfiguracja

**Cel**: Działające testy (unit + E2E)

**Zadania**:

1. ✅ Zweryfikować `vitest.config.ts` (happy-dom)
2. ✅ Zweryfikować `playwright.config.ts`
3. Dodać przykładowe testy:
   - `test/unit/utils/seo.test.ts` - test utility functions
   - `test/nuxt/components/Hero.test.ts` - test komponentu
   - `tests/pages/home.spec.ts` - E2E test strony głównej
   - `tests/pages/contact.spec.ts` - E2E test formularza

4. Zweryfikować że `npm run test` działa
5. Zweryfikować że `npm run test:e2e` działa

**Definition of Done**:

- Wszystkie testy przechodzą
- CI/CD pipeline działa (jeśli skonfigurowany)

---

### KROK 9: Integracje opcjonalne

**Cel**: Gotowe do użycia, ale nie wymagane

**Zadania**:

1. Dodać konfigurację Plausible Analytics (opcjonalna)
2. Dodać komentarze w kodzie jak dodać cookie banner (jeśli potrzeba)
3. Dodać `.env.example` z przykładowymi zmiennymi

**Definition of Done**:

- Plausible działa jeśli `NUXT_PUBLIC_PLAUSIBLE_DOMAIN` ustawione
- Dokumentacja jak włączyć/wyłączyć

---

### KROK 10: Dokumentacja i finalizacja

**Cel**: Starter gotowy do publikacji

**Zadania**:

1. Zaktualizować `README.md`:
   - Opis startera
   - Quick start guide
   - Lista modułów i konfiguracji
   - Jak rozszerzać starter

2. Dodać `LICENSE` (MIT)
3. Dodać `.env.example`
4. Zweryfikować `.gitignore`
5. Dodać przykładowe screenshots (opcjonalnie)
6. Final code review

**Definition of Done**:

- README kompletny i pomocny
- Wszystkie pliki na miejscu
- Starter gotowy do `git push`

---

## 5. CHECKLIST "DEFINITION OF DONE" - WERSJA PODSTAWOWA

### Funkcjonalność

- [ ] Wszystkie wymagane podstrony działają (`/`, `/oferta`, `/portfolio`, `/o-nas`, `/kontakt`)
- [ ] Blog działa (jeśli w bazie): `/blog`, `/blog/[slug]`
- [ ] Formularz kontaktowy działa (walidacja + wysyłka)
- [ ] Wszystkie linki w nawigacji działają
- [ ] Responsywność na mobile/tablet/desktop
- [ ] Dark mode działa

### SEO

- [ ] Meta title/description na wszystkich stronach
- [ ] OpenGraph tags działają
- [ ] Twitter Cards działają
- [ ] Canonical URLs ustawione
- [ ] `sitemap.xml` generowany i dostępny
- [ ] `robots.txt` poprawny
- [ ] RSS feed działa (jeśli blog w bazie)
- [ ] Semantyczna struktura nagłówków (h1-h6)
- [ ] Alt text na obrazach

### Techniczne

- [ ] Nuxt 4 działa bez błędów
- [ ] Wszystkie moduły skonfigurowane i działają
- [ ] TypeScript bez błędów
- [ ] ESLint przechodzi (`npm run lint`)
- [ ] Prettier przechodzi (`npm run format:check`)
- [ ] Build produkcyjny działa (`npm run build`)
- [ ] Preview produkcyjny działa (`npm run preview`)

### Testy

- [ ] Unit tests przechodzą (`npm run test:unit`)
- [ ] Component tests przechodzą (`npm run test:nuxt`)
- [ ] E2E tests przechodzą (`npm run test:e2e`)
- [ ] CI/CD pipeline działa (jeśli skonfigurowany)

### Dokumentacja

- [ ] README.md kompletny
- [ ] `.env.example` z przykładowymi zmiennymi
- [ ] Komentarze w kodzie gdzie potrzeba
- [ ] LICENSE dodany

### Design System

- [ ] Spójne użycie Nuxt UI komponentów
- [ ] Zdefiniowane kolory w `app.config.ts`
- [ ] Spójne spacing i typografia
- [ ] Warianty przycisków ustandaryzowane

---

## 6. PLAN "POD MODUŁY" - ROZSZERZANIE STARTERA

### Strategia rozszerzania

Starter ma być **"update-owalny"** - możliwość aktualizacji core bez ręcznego merge'owania w każdym projekcie.

**Rekomendowane podejścia**:

1. **Nuxt Layers** (NAJLEPSZE dla większych modułów)
   - Oddzielne repo dla każdego modułu
   - Instalacja przez `extends` w `nuxt.config.ts`
   - Przykład: `@Auriaz/nuxt-base-starter-auth`

2. **NPM Packages** (dla małych utilities)
   - Publikowane jako pakiety npm
   - Instalacja przez `npm install`
   - Przykład: `@auriaz/nuxt-crm-lite`

3. **Git Submodules** (alternatywa dla layers)
   - Mniej elastyczne, ale prostsze
   - Dobre dla wewnętrznych projektów

### Typy modułów - blueprint

#### 1. Auth Module (`@Auriaz/nuxt-base-starter-auth`)

**Odpowiedzialność**:

- Autentykacja użytkowników (login, register, logout)
- Session management
- Protected routes middleware
- User profile pages

**Granice**:

- NIE zarządza uprawnieniami (to osobny moduł)
- NIE integruje z zewnętrznymi providerami (to osobny moduł)
- TAK - podstawowa autentykacja email/password

**Instalacja**:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ['@Auriaz/nuxt-base-starter-auth'],
})
```

---

#### 2. Dashboard Module (`@Auriaz/nuxt-base-starter-dashboard`)

**Odpowiedzialność**:

- Panel administracyjny
- Dashboard layout
- Podstawowe statystyki
- Listy danych (tables, filters)

**Granice**:

- NIE zawiera specyficznej logiki biznesowej
- TAK - uniwersalne komponenty dashboardu
- TAK - przykładowe widoki (users, settings)

**Instalacja**:

```typescript
export default defineNuxtConfig({
  extends: ['@Auriaz/nuxt-base-starter-dashboard'],
})
```

---

#### 3. CRM-Lite Module (`@Auriaz/nuxt-base-starter-crm`)

**Odpowiedzialność**:

- Zarządzanie kontaktami (leads, customers)
- Pipeline sprzedażowy
- Podstawowe raporty
- Integracje z email

**Granice**:

- NIE pełny CRM (to byłby osobny produkt)
- TAK - podstawowe funkcje CRM dla małych firm
- TAK - rozszerza Dashboard Module

**Zależności**:

- Wymaga Auth Module
- Wymaga Dashboard Module

---

#### 4. Media Module (`@Auriaz/nuxt-base-starter-media`)

**Odpowiedzialność**:

- Upload i zarządzanie plikami
- Image optimization (rozszerza `@nuxt/image`)
- Gallery components
- Media library UI

**Granice**:

- NIE integruje z zewnętrznymi storage (S3, Cloudinary) - to osobne moduły
- TAK - lokalne zarządzanie plikami
- TAK - podstawowe komponenty galerii

---

#### 5. Email Module (`@Auriaz/nuxt-base-starter-email`)

**Odpowiedzialność**:

- Wysyłka emaili (transakcyjne, marketingowe)
- Email templates
- Queue management (opcjonalnie)
- Email preview

**Granice**:

- NIE integruje z konkretnym providerem (SendGrid, Mailgun) - konfiguracja przez env
- TAK - abstrakcja nad email API
- TAK - system szablonów

---

#### 6. E-commerce Module (`@Auriaz/nuxt-base-starter-ecommerce`)

**Odpowiedzialność**:

- Katalog produktów
- Koszyk i checkout
- Zamówienia
- Integracja z płatnościami (abstrakcja)

**Granice**:

- NIE pełny sklep (to byłby osobny produkt)
- TAK - podstawowe funkcje e-commerce
- TAK - rozszerza Base Starter

---

### Zasady projektowania modułów

1. **Dependency Injection** - moduły nie powinny hardcodować zależności
2. **Configuration over Code** - wszystko konfigurowalne przez `nuxt.config.ts` lub env
3. **Composable-first** - logika w composables, nie w komponentach
4. **Type Safety** - pełne wsparcie TypeScript
5. **Backward Compatibility** - aktualizacje core nie łamią modułów

### Przykład struktury modułu (Nuxt Layer)

```
nuxt-base-starter-auth/
├── app/
│   ├── components/
│   │   └── auth/
│   ├── pages/
│   │   └── auth/
│   ├── middleware/
│   │   └── auth.ts
│   └── composables/
│       └── useAuth.ts
├── server/
│   └── api/
│       └── auth/
├── nuxt.config.ts        # Konfiguracja modułu
└── package.json
```

**Instalacja w projekcie**:

```bash
npm install @Auriaz/nuxt-base-starter-auth
```

```typescript
// nuxt.config.ts w projekcie
export default defineNuxtConfig({
  extends: [
    '@Auriaz/nuxt-base-starter', // Base starter
    '@Auriaz/nuxt-base-starter-auth', // Auth module
  ],
})
```

---

## 7. DODATKOWE UWAGI I ZAŁOŻENIA

### Założenia przyjęte (best effort)

1. **Nazewnictwo ścieżek**: Polskie (`/oferta`, `/o-nas`) - lepsze SEO dla PL
2. **Blog w bazie**: TAK - łatwo usunąć jeśli niepotrzebny
3. **Coverage testów**: NIE na start - można dodać później
4. **Cookie banner**: NIE na start - Plausible nie wymaga
5. **Nuxt Studio**: OPCJONALNIE - tylko jeśli potrzeba CMS
6. **Renderowanie**: SSG domyślnie, SSR dla formularzy

### Aktualizowalność core

**Strategia**:

1. Core starter w osobnym repo (`@Auriaz/nuxt-base-starter`)
2. Projekty używają `extends` w `nuxt.config.ts`
3. Aktualizacje core przez `npm update @Auriaz/nuxt-base-starter`
4. Breaking changes w osobnych major versions

**Przykład**:

```typescript
// W projekcie klienta
export default defineNuxtConfig({
  extends: ['@Auriaz/nuxt-base-starter'],
  // Customizacje projektu
  app: {
    head: {
      title: 'Moja Strona',
    },
  },
})
```

---

## 8. NASTĘPNE KROKI PO WDROŻENIU

1. **Testowanie na różnych środowiskach** (dev, staging, prod)
2. **Optymalizacja performance** (lighthouse scores)
3. **Dokumentacja rozszerzeń** (jak tworzyć moduły)
4. **Przykładowe projekty** (demo apps używające startera)
5. **Community feedback** - iteracja na podstawie użycia

---

**Plan gotowy do wdrożenia. Każdy krok jest niezależny i można go wykonać osobno, zachowując działający stan po każdym kroku.**
