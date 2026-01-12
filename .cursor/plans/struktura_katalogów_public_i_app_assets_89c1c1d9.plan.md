---
name: Struktura katalogów public i app/assets
overview: Zaplanowanie organizacji katalogów public/ i app/assets/ dla Nuxt Base Starter, z wyjaśnieniem różnic i best practices dla każdego z nich.
todos: []
---

# Struktura katalogów public/ i app/assets/

## 1. Różnica między public/ a app/assets/

### 1.1 public/ - Pliki statyczne

**Charakterystyka:**

- Pliki serwowane bezpośrednio przez serwer
- Dostępne przez URL (np. `/favicon.ico`, `/images/logo.png`)
- Nie są przetwarzane przez Vite
- Nie są optymalizowane automatycznie
- Idealne dla: favicon, og-image, dokumenty PDF, pliki do pobrania

**Przykład użycia:**

```vue
<img src="/favicon.ico" alt="Logo" />
```

### 1.2 app/assets/ - Zasoby przetwarzane

**Charakterystyka:**

- Pliki przetwarzane przez Vite podczas build
- Importowane w kodzie (import/require)
- Optymalizowane automatycznie (obrazy, CSS)
- Hashowane nazwy plików dla cache busting
- Idealne dla: obrazy używane w komponentach, fonty, CSS, SVG jako komponenty

**Przykład użycia:**

```vue
<script setup>
  import logo from '~/assets/images/logo.svg'
</script>
<template>
  <img :src="logo" alt="Logo" />
</template>
```

### 1.3 Kiedy używać którego?

**Użyj `public/` gdy:**

- Plik musi być dostępny przez bezpośredni URL
- Plik jest referencowany w meta tags (favicon, og-image)
- Plik jest używany w content (markdown, JSON)
- Dokumenty do pobrania (PDF, DOC)

**Użyj `app/assets/` gdy:**

- Obraz jest importowany w komponencie Vue
- Chcesz optymalizację przez Vite/Nuxt Image
- Fonty do importu w CSS
- SVG jako komponenty Vue
- Obrazy używane w stylach CSS

## 2. Struktura public/

```
public/
├── favicon.ico                    # Główna ikona favicon
├── icons/                         # Ikony aplikacji (PWA-ready)
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   ├── apple-touch-icon.png
│   └── favicon-16x16.png
├── images/                        # Obrazy ogólne (bezpośrednie URL)
│   ├── og-image.png              # Domyślny obraz OpenGraph (1200x630)
│   ├── og-image-fallback.png
│   ├── logo.png                  # Logo (jeśli używane w meta/content)
│   └── logo-dark.png
├── blog/                          # Obrazy bloga (opcjonalnie)
│   └── .gitkeep
├── portfolio/                     # Obrazy portfolio (opcjonalnie)
│   └── .gitkeep
└── documents/                     # Dokumenty do pobrania (opcjonalnie)
    └── .gitkeep
```

## 3. Struktura app/assets/

```
app/assets/
├── css/                           # Style CSS
│   ├── main.css                  # Główny plik CSS (już istnieje)
│   ├── components.css            # Style dla komponentów (opcjonalnie)
│   └── utilities.css             # Utility classes (opcjonalnie)
├── images/                        # Obrazy do importu w komponentach
│   ├── logo.svg                  # Logo jako SVG (do importu)
│   ├── logo.png                  # Logo PNG (do importu)
│   ├── icons/                    # Ikony SVG do importu
│   │   ├── check.svg
│   │   ├── arrow-right.svg
│   │   └── ...
│   └── illustrations/            # Ilustracje
│       └── ...
├── fonts/                        # Fonty (jeśli używane)
│   ├── public-sans/             # Font Public Sans
│   │   ├── public-sans-regular.woff2
│   │   ├── public-sans-bold.woff2
│   │   └── ...
│   └── ...
└── scss/                         # SCSS files (jeśli używane zamiast CSS)
    ├── variables.scss
    ├── mixins.scss
    └── ...
```

## 4. Szczegółowe wyjaśnienie app/assets/

### 4.1 css/

**Przeznaczenie:** Style CSS aplikacji

**Pliki:**

- `main.css` - Główny plik CSS (już istnieje)
  - Importowany w `nuxt.config.ts`
  - Zawiera Tailwind imports i custom theme
- `components.css` - Style specyficzne dla komponentów (opcjonalnie)
- `utilities.css` - Utility classes (opcjonalnie)

**Użycie:**

```typescript
// nuxt.config.ts
css: ['~/assets/css/main.css']
```

### 4.2 images/

**Przeznaczenie:** Obrazy importowane w komponentach Vue

**Różnica vs public/images/:**

- `app/assets/images/` - importowane w kodzie, optymalizowane przez Vite
- `public/images/` - dostępne przez URL, nie optymalizowane

**Przykład użycia:**

```vue
<script setup>
  import logo from '~/assets/images/logo.svg'
  import heroImage from '~/assets/images/hero-bg.jpg'
</script>

<template>
  <img :src="logo" alt="Logo" />
  <NuxtImg :src="heroImage" alt="Hero" />
</template>
```

**Z @nuxt/image:**

```vue
<script setup>
  import heroImage from '~/assets/images/hero-bg.jpg'
</script>

<template>
  <!-- NuxtImg automatycznie optymalizuje obrazy z assets -->
  <NuxtImg :src="heroImage" alt="Hero" format="webp" />
</template>
```

### 4.3 fonts/

**Przeznaczenie:** Fonty do importu w CSS

**Struktura:**

```
fonts/
├── public-sans/                  # Font family
│   ├── public-sans-regular.woff2
│   ├── public-sans-regular.woff
│   ├── public-sans-bold.woff2
│   ├── public-sans-bold.woff
│   └── public-sans.css          # @font-face declarations
└── ...
```

**Użycie w CSS:**

```css
/* app/assets/css/main.css */
@font-face {
  font-family: 'Public Sans';
  src: url('~/assets/fonts/public-sans/public-sans-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
}
```

**Alternatywa:** Fonty mogą być też w `public/fonts/` jeśli są używane przez `@font-face` z URL.

### 4.4 scss/ (opcjonalnie)

**Przeznaczenie:** Pliki SCSS jeśli używane zamiast CSS

**Uwaga:** Obecnie projekt używa Tailwind CSS, więc SCSS może nie być potrzebne.

## 5. Best practices dla app/assets/

### 5.1 Obrazy

**Kiedy używać app/assets/images/:**

- Obrazy używane w komponentach Vue
- Obrazy wymagające optymalizacji
- SVG jako komponenty (importowane jako komponenty Vue)
- Obrazy używane w stylach CSS (background-image)

**Kiedy używać public/images/:**

- Obrazy referencowane w meta tags (og-image)
- Obrazy w content markdown
- Obrazy używane przez zewnętrzne API
- Obrazy wymagające bezpośredniego URL

### 5.2 SVG jako komponenty

Nuxt automatycznie konwertuje SVG z `app/assets/` na komponenty Vue:

```vue
<!-- app/assets/images/icons/check.svg -->
<script setup>
  import CheckIcon from '~/assets/images/icons/check.svg'
</script>

<template>
  <CheckIcon class="w-5 h-5" />
</template>
```

### 5.3 Optymalizacja obrazów

**Z @nuxt/image:**

- Obrazy z `app/assets/` są automatycznie optymalizowane
- Generowane są wersje WebP, AVIF
- Lazy loading
- Responsive images

**Przykład:**

```vue
<script setup>
  import heroImage from '~/assets/images/hero.jpg'
</script>

<template>
  <NuxtImg :src="heroImage" format="webp" sizes="sm:100vw md:50vw lg:1920px" loading="lazy" />
</template>
```

## 6. Porównanie użycia

### 6.1 Logo

**Opcja 1: public/images/logo.png**

```vue
<!-- Użycie w meta tags lub content -->
<img src="/images/logo.png" alt="Logo" />
```

**Opcja 2: app/assets/images/logo.svg**

```vue
<script setup>
  import logo from '~/assets/images/logo.svg'
</script>
<template>
  <img :src="logo" alt="Logo" />
  <!-- lub jako komponent SVG -->
  <Logo class="w-10 h-10" />
</template>
```

### 6.2 Obrazy w komponentach

**app/assets/images/ (zalecane):**

```vue
<script setup>
  import featureImage from '~/assets/images/features/hero.jpg'
</script>
<template>
  <NuxtImg :src="featureImage" alt="Feature" />
</template>
```

**public/images/ (niezalecane dla komponentów):**

```vue
<template>
  <img src="/images/features/hero.jpg" alt="Feature" />
  <!-- Brak optymalizacji przez Vite -->
</template>
```

### 6.3 Obrazy w content

**public/images/ (wymagane):**

```markdown
<!-- content/blog/post.md -->

![Image](/images/blog/post-image.jpg)
```

**app/assets/ nie działa w markdown** - markdown wymaga bezpośrednich URL.

## 7. Migracja i organizacja

### 7.1 Obecny stan

**app/assets/:**

- `css/main.css` - istnieje ✓

**public/:**

- `favicon.ico` - istnieje ✓
- `_robots.txt` - istnieje (do sprawdzenia)

### 7.2 Rekomendacje

**Dla startera:**

- `public/` - favicon, og-image, ikony PWA, dokumenty
- `app/assets/` - CSS, obrazy do komponentów, fonty (jeśli lokalne)

**Dla bloga:**

- Obrazy w `content/blog/` (Nuxt Content) lub `public/blog/` (jeśli wspólne)
- Obrazy autorów w `public/images/authors/` lub `app/assets/images/authors/`

**Dla portfolio:**

- Obrazy projektów w `public/portfolio/` (jeśli w content) lub `app/assets/images/portfolio/` (jeśli w komponentach)

## 8. Checklist implementacji

### 8.1 public/

- [ ] Utworzyć strukturę katalogów (`icons/`, `images/`, `images/placeholders/`)
- [ ] Utworzyć `images/og-image.png`
- [ ] Utworzyć ikony PWA w `icons/`
- [ ] Sprawdzić `_robots.txt` (czy powinien być `robots.txt`)

### 8.2 app/assets/

- [ ] Utworzyć strukturę katalogów (`images/`, `fonts/` jeśli potrzebne)
- [ ] Przenieść/utworzyć logo w `images/logo.svg` (jeśli używane w komponentach)
- [ ] Utworzyć `images/icons/` dla ikon SVG
- [ ] Utworzyć `images/illustrations/` dla ilustracji (opcjonalnie)
- [ ] Dodać fonty w `fonts/` jeśli używane lokalnie (opcjonalnie)

### 8.3 Aktualizacja kodu

- [ ] Zaktualizować `app/composables/useSeo.ts` - ścieżka do `/images/og-image.png`
- [ ] Zaktualizować `app/components/Logo/Logo.vue` - użyć importu z `app/assets/` lub `/images/logo.png`
- [ ] Sprawdzić wszystkie komponenty używające obrazów - użyć `app/assets/` dla optymalizacji

## 9. Przykładowa struktura końcowa

```
public/
├── favicon.ico
├── icons/
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   └── apple-touch-icon.png
└── images/
    ├── og-image.png
    └── placeholders/
        └── image-placeholder.svg

app/assets/
├── css/
│   └── main.css
├── images/
│   ├── logo.svg
│   ├── icons/
│   │   ├── check.svg
│   │   └── arrow-right.svg
│   └── illustrations/
│       └── hero-bg.svg
└── fonts/ (opcjonalnie)
    └── public-sans/
        └── ...
```

## 10. Uwagi techniczne

### 10.1 Import paths

**W Nuxt 4:**

- `~/assets/` - alias dla `app/assets/`
- `@/assets/` - alternatywny alias
- `/images/` - bezpośredni URL do `public/images/`

### 10.2 Optymalizacja

- Obrazy z `app/assets/` są optymalizowane przez Vite
- `@nuxt/image` dodatkowo optymalizuje obrazy z `app/assets/`
- Obrazy z `public/` nie są optymalizowane (użyj `NuxtImg` z URL)

### 10.3 Build output

- `app/assets/` - pliki są przetwarzane i kopiowane do `.output/public/_nuxt/` z hashowanymi nazwami
- `public/` - pliki są kopiowane bezpośrednio do `.output/public/`

### 10.4 TypeScript

- Importy z `app/assets/` są typowane przez Vite
- Można dodać type declarations dla SVG jako komponentów

## 11. Dokumentacja

Struktura powinna być udokumentowana w README.md z wyjaśnieniem:

- Różnicy między `public/` a `app/assets/`
- Kiedy używać którego katalogu
- Przykłady użycia dla każdego typu zasobu
