---
name: Skalowalny Footer z Content Layer
overview: Zaprojektowanie i implementacja skalowalnego komponentu Footer w Nuxt, który będzie w pełni konfigurowalny przez Content Layer z fallback do app.meta, zintegrowany z Nuxt UI, Schema.org i gotowy na przyszłe rozszerzenia.
todos:
  - id: footer-schemas
    content: Utworzyć shared/schemas/footer.ts z schematami Valibot (FooterLinkSchema, FooterColumnSchema, FooterContactSchema, FooterSocialSchema, FooterLegalSchema, FooterNewsletterSchema, FooterConfigSchema)
    status: completed
  - id: footer-types
    content: Utworzyć shared/types/footer.ts z typami TypeScript (InferOutput z schematów + pomocnicze typy)
    status: completed
    dependencies:
      - footer-schemas
  - id: content-config-app
    content: Dodać kolekcję app do content.config.ts dla plików konfiguracyjnych aplikacji
    status: completed
    dependencies:
      - footer-schemas
  - id: footer-content-file
    content: Utworzyć content/app/footer.md z przykładową konfiguracją (brand, columns, contact, social, legal, newsletter, theme, container, spacing, schema)
    status: completed
    dependencies:
      - footer-schemas
  - id: use-footer-config
    content: Utworzyć app/composables/useFooterConfig.ts - composable pobierający dane z content/app/footer.md z fallback do app.meta.ts
    status: completed
    dependencies:
      - footer-types
      - content-config-app
  - id: app-footer-component
    content: 'Utworzyć app/components/Footer/AppFooter.vue - komponent prezentacyjny z Nuxt UI (UContainer, ULink, UButton, UInput, UIcon, UDivider), layout responsywny (grid mobile/tablet/desktop), sekcje: brand, columns, contact, social, newsletter, legal, back-to-top'
    status: completed
    dependencies:
      - use-footer-config
  - id: footer-schema-org
    content: Dodać Schema.org (Organization, WebSite) w AppFooter.vue z warunkowym włączaniem przez config.schema.enabled, bezpieczne SSR
    status: completed
    dependencies:
      - app-footer-component
  - id: footer-integration
    content: Zintegrować AppFooter w app/layouts/default.vue (zastąpić Footer na AppFooter)
    status: completed
    dependencies:
      - app-footer-component
  - id: footer-docs
    content: 'Utworzyć docs/FOOTER.md z dokumentacją: jak edytować footer.md, dodawać kolumny/linki/social, włączać newsletter, zmieniać theme/container/spacing'
    status: completed
    dependencies:
      - footer-content-file
  - id: footer-a11y-external
    content: Dodać obsługę linków zewnętrznych (target=_blank, rel=noopener), aria-label dla ikon social, semantic HTML (nav, footer, address)
    status: completed
    dependencies:
      - app-footer-component
---

# Plan: Skalowalny Footer z Content Layer

## Architektura

```
content/app/footer.md (konfiguracja)
    ↓
useFooterConfig() (composable - pobiera + fallback)
    ↓
AppFooter.vue (komponent prezentacyjny)
    ↓
default.vue (layout - integracja globalna)
```

## 1. Model danych i schematy

### 1.1 Schemat Valibot (`shared/schemas/footer.ts`)

Utworzyć nowy plik z schematami:

- **FooterLinkSchema**: `{ label, to/href, external?, icon? }`
- **FooterColumnSchema**: `{ title, links: FooterLinkSchema[] }`
- **FooterContactSchema**: `{ email?, phone?, address?, hours? }`
- **FooterSocialSchema**: `{ name, href, icon }`
- **FooterLegalSchema**: `{ privacyUrl?, termsUrl?, cookiesUrl?, companyName, yearStart? }`
- **FooterNewsletterSchema**: `{ enabled?, title?, description?, placeholder?, buttonLabel? }`
- **FooterConfigSchema**: główny schemat łączący wszystkie sekcje + `theme`, `container`, `spacing`, `schema.enabled`

### 1.2 Typy TypeScript (`shared/types/footer.ts`)

Wyeksportować typy z `InferOutput<typeof FooterConfigSchema>` oraz pomocnicze typy dla każdej sekcji.

## 2. Content Layer - konfiguracja

### 2.1 Kolekcja w `content.config.ts`

Dodać nową kolekcję `app` dla plików konfiguracyjnych aplikacji:

```typescript
app: defineCollection({
  type: 'data',
  source: 'app/*.md',
  schema: FooterConfigSchema,
})
```

### 2.2 Plik konfiguracyjny (`content/app/footer.md`)

Przykładowa struktura z frontmatter:

```yaml
---
brand:
  name: 'Nuxt Base Starter'
  description: 'Profesjonalny starter dla nowoczesnych aplikacji'
  logo: '/favicon.ico'
columns:
 - title: 'Oferta'
    links:
   - label: 'Portfolio'
        to: '/portfolio'
   - label: 'Usługi'
        to: '/oferta'
 - title: 'Firma'
    links:
   - label: 'O nas'
        to: '/o-nas'
   - label: 'Blog'
        to: '/blog'
 - title: 'Kontakt'
    links:
   - label: 'Kontakt'
        to: '/kontakt'
contact:
  email: 'a.stankiewicz7@gmail.com'
  phone: '+48 123 456 789'
  address: 'ul. Przykładowa 1, 00-000 Warszawa'
  hours: 'Pon-Pt: 9:00-17:00'
social:
 - name: 'GitHub'
    href: 'https://github.com/auriaz'
    icon: 'i-simple-icons-github'
 - name: 'Website'
    href: 'https://web-space.pl'
    icon: 'i-lucide-globe'
legal:
  companyName: 'Nuxt Base Starter'
  yearStart: 2024
  privacyUrl: '/polityka-prywatnosci'
  termsUrl: '/regulamin'
  cookiesUrl: '/polityka-cookies'
newsletter:
  enabled: false
  title: 'Newsletter'
  description: 'Zapisz się do newslettera'
  placeholder: 'Twój email'
  buttonLabel: 'Zapisz się'
theme: 'light'
container: 'default'
spacing: 'md'
schema:
  enabled: true
---
```

## 3. Composable (`app/composables/useFooterConfig.ts`)

Funkcjonalność:

1.  Pobiera dane z `content/app/footer.md` przez `queryCollection('app').path('/app/footer').first()`
2.  Fallback do `app.meta.ts`:

                                                                                                - `brand.name` → `appMeta.name`
                                                                                                - `brand.description` → `appMeta.description`
                                                                                                - `contact.email` → `appMeta.contactEmail`
                                                                                                - `social` → mapowanie `appMeta.sameAs` do `FooterSocial[]`
                                                                                                - `legal.companyName` → `appMeta.name`

3.  Zwraca `computed<FooterConfig>` z `useAsyncData`
4.  Obsługuje brak pliku content (tylko fallback)

## 4. Komponent Footer (`app/components/Footer/AppFooter.vue`)

### 4.1 Struktura UI (Nuxt UI)

Layout responsywny:

- **Desktop**: Grid 3-5 kolumn (brand + columns + contact + social + newsletter)
- **Mobile**: Stacked sections z akordeonem (opcjonalnie) lub po prostu stacked

Komponenty Nuxt UI:

- `UContainer` - kontener główny
- `UDivider` - separator między sekcjami
- `ULink` - linki nawigacji
- `UButton` - przyciski (newsletter, back to top)
- `UInput` - pole email dla newslettera
- `UIcon` - ikony social media
- `UBadge` - opcjonalnie dla highlightów

### 4.2 Sekcje

1. **Brand**: Logo (Logo component) + nazwa + opis
2. **Columns**: Grid kolumn z linkami (mapowanie `columns[]`)
3. **Contact**: Email, telefon, adres, godziny (jeśli dostępne)
4. **Social**: Ikony social media w rzędzie
5. **Newsletter**: Formularz (opcjonalnie, jeśli `newsletter.enabled === true`)
6. **Legal**: Copyright + linki (polityka prywatności, regulamin, cookies)
7. **Back to top**: Przycisk scroll to top (opcjonalnie)

### 4.3 Responsywność

- Mobile: `flex-col`, stacked sections
- Tablet: `grid-cols-2`
- Desktop: `grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`

### 4.4 Warianty

- `theme: 'light' | 'dark' | 'brand'` - kolory tła i tekstu
- `container: 'default' | 'wide'` - szerokość kontenera
- `spacing: 'sm' | 'md' | 'lg'` - padding sekcji

## 5. Schema.org Integration

### 5.1 Organization Schema

W `AppFooter.vue`:

```typescript
import { defineOrganization, defineWebSite } from 'nuxt-schema-org/schema'

const footerSchema = computed(() => {
  if (!config.value.schema?.enabled) return null

  const appMeta = useAppMeta()

  return [
    defineOrganization({
      name: config.value.brand?.name || appMeta.name,
      url: appMeta.url,
      logo: config.value.brand?.logo || appMeta.icon,
      sameAs: config.value.social?.map((s) => s.href) || appMeta.sameAs,
      email: config.value.contact?.email || appMeta.contactEmail,
      // address, telephone jeśli dostępne
    }),
    defineWebSite({
      name: config.value.brand?.name || appMeta.name,
      url: appMeta.url,
    }),
  ]
})

if (footerSchema.value) {
  useSchemaOrg(footerSchema.value.filter(Boolean))
}
```

### 5.2 Bezpieczeństwo SSR

- Warunkowe renderowanie tylko gdy `schema.enabled === true`
- Fallback do `null` jeśli brak danych
- Type guards dla bezpieczeństwa typów

## 6. Integracja globalna

### 6.1 Layout (`app/layouts/default.vue`)

Zastąpić obecny `<Footer />` na `<AppFooter />`:

```vue
<AppFooter />
```

### 6.2 Composable w komponencie

`AppFooter.vue` używa `useFooterConfig()` do pobrania danych.

## 7. Dodatkowe funkcjonalności

### 7.1 Linki zewnętrzne

Automatyczne wykrywanie linków zewnętrznych (sprawdzenie `href` vs `to`):

- Jeśli `external === true` lub `href` zaczyna się od `http`: `target="_blank" rel="noopener noreferrer"`

### 7.2 A11y

- `aria-label` dla ikon social media
- Semantic HTML (`<nav>`, `<footer>`, `<address>`)
- Keyboard navigation

### 7.3 Back to top

Opcjonalny przycisk scroll to top (jeśli `backToTop: true` w config):

```typescript
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

## 8. Dokumentacja

Utworzyć `docs/FOOTER.md` z:

- Jak edytować `content/app/footer.md`
- Jak dodać nową kolumnę
- Jak dodać nowy link social
- Jak włączyć/wyłączyć newsletter
- Jak zmienić theme/container/spacing

## 9. Pliki do utworzenia/zmodyfikowania

### Nowe pliki:

1. `shared/schemas/footer.ts` - schematy Valibot
2. `shared/types/footer.ts` - typy TypeScript
3. `app/composables/useFooterConfig.ts` - composable z fallback
4. `app/components/Footer/AppFooter.vue` - komponent główny
5. `content/app/footer.md` - konfiguracja content
6. `docs/FOOTER.md` - dokumentacja

### Modyfikacje:

1. `content.config.ts` - dodanie kolekcji `app`
2. `app/layouts/default.vue` - zamiana `<Footer />` na `<AppFooter />`
3. `app/components/Footer/Footer.vue` - można zachować jako backup lub usunąć

## 10. Przykładowa konfiguracja dla web-space

Zgodnie z wymaganiami użytkownika:

- Kolumna "Oferta": Portfolio, Usługi
- Kolumna "Firma": O nas, Blog
- Kolumna "Kontakt": Kontakt
- Kolumna "Social": GitHub, Website (z app.meta.sameAs)
- Legal: Polityka prywatności, Regulamin, Cookies
- Contact: Email, telefon, adres (z app.meta lub content)

## 11. Testowanie

- Sprawdzenie działania z `content/app/footer.md`
- Sprawdzenie fallback do `app.meta.ts` (usunięcie pliku content)
- Sprawdzenie responsywności (mobile, tablet, desktop)
- Sprawdzenie Schema.org w DevTools
- Sprawdzenie a11y (screen reader, keyboard navigation)
