---
name: ''
overview: ''
todos: []
isProject: false
---

## 1) Struktura katalogów `content/legal`

Proponowana struktura (PL jako domyślny język, łatwa rozbudowa o i18n):

- `content/`
  - `legal/`
    - `privacy-policy.md` – Polityka prywatności
    - `terms-of-service.md` – Regulamin
    - `cookies-policy.md` – Polityka cookies
  - (przyszłościowo)
    - `legal/en/`
      - `privacy-policy.md`
      - `terms-of-service.md`
      - `cookies-policy.md`

**Konwencje:**

- **Nazwy plików**: angielskie, techniczne `privacy-policy.md`), niezależne od języka UI.
- **Ścieżki URL** są kontrolowane przez frontmatter `path`) lub transformację w routerze (mapowanie `slug → path`).
- **Jedna kolekcja Nuxt Content** np. `legal`, z własnym schematem `LegalPageSchema`), ale kompatybilna z istniejącym `PageSchema` (podzbiór pól).

---

## 2) Przykładowy frontmatter jednego pliku `.md`

Przykład dla `content/legal/privacy-policy.md`:

```md
---
title: 'Polityka prywatności'

description: 'Dowiedz się, w jaki sposób przetwarzamy Twoje dane osobowe i dbamy o bezpieczeństwo informacji.'

path: '/polityka-prywatnosci'

slug: 'privacy-policy'

updatedAt: '2025-02-01'

locale: 'pl' # future-proof pod i18n

type: 'legal' # ułatwia filtrowanie / SEO

legalKind: 'privacy' # privacy | terms | cookies
---

# 1. Postanowienia ogólne

Treść polityki...

## 2. Administrator danych

...

### 2.1. Dane kontaktowe

...
```

**Konwencje frontmatter:**

- **title** – używany jako H1 oraz w `<title>`.
- **description** – meta description, widoczny też pod H1.
- **path** – docelowy URL (jedno źródło prawdy).
- **slug** – techniczny identyfikator (do nawigacji, list, linków w kodzie).
- **updatedAt** – ręcznie utrzymywany lub nadpisywany przez build (np. z `git`).
- **locale** – kod języka (PL/EN).
- **type / legalKind** – pozwalają łatwo filtrować i rozróżniać typy stron prawnych.

---

## 3) Schema strony (content schema)

### Wspólna schema

- **LegalPageSchema** może rozszerzać istniejący `PageSchema` albo być osobną, ale:
  - pola **wspólne**: `title`, `description`, `pathslug`, `updatedAt`, `seo?`.
  - pola **legal-specific**: `type: 'legal'`, `legalKind`, opcjonalnie `version`.

**Minimalny zestaw pól (MUST):**

- **title**: string – wymagane.
- **description**: string – wymagane.
- **path**: string – wymagane, unikalny URL.
- **slug**: string – wymagane, unikalny w obrębie kolekcji.
- **type**: literal `'legal'`.
- **legalKind**: picklist `['privacy', 'terms', 'cookies']`.
- **updatedAt**: string/date – opcjonalne (dla wersjonowania / „ostatnia aktualizacja”).
- **locale**: picklist dostępnych języków `'pl' | 'en'` itd.).

**Kompatybilność z istniejącym systemem:**

- Legal pages **nie używają** `SectionsRenderer` ani `PageSection` z content buildera, tylko:
  - własny, prosty layout tekstowy,
  - ale mogą korzystać z tych samych bazowych komponentów `UPage`, `UPageBody`, ewentualnie `PageSection` jako „wrapper” wokół całości).
- W `PageSchema` można mieć pole `type`, a dla prawnych wpisów ustawiać `type: 'legal'` – ułatwia reużycie logiki SEO, breadcrumbs itp.

---

## 4) Routing i pages

### Strategia routingu

- Dedykowana przestrzeń URL dla stron prawnych:
  - `/polityka-prywatnosci`
  - `/regulamin`
  - `/polityka-cookies`
- Wszystkie 3 strony są renderowane przez **wspólną stronę Nuxt**:

**Opcja A (czytelna, prosta):**

- `app/pages/legal/[slug].vue`:
  - odpowiada za pobranie dokumentu z kolekcji `legal` po `slug` lub `path`.
  - mapuje:
    - `/legal/polityka-prywatnosci` → docelowy content,
    - a w routerze / linkach możesz wystawiać aliasy `/polityka-prywatnosci` przez `route alias` lub `redirect`.

**Opcja B (bardziej „SEO friendly” od razu):**

- 3 dedykowane pliki:
  - `app/pages/polityka-prywatnosci.vue`
  - `app/pages/regulamin.vue`
  - `app/pages/polityka-cookies.vue`
- Każdy z nich:
  - ma minimalny kod: „znajdź odpowiedni rekord `legal` po `legalKind` lub `path` i wyrenderuj w wspólnym layoutcie”.
- Architektonicznie:
  - masz **1 wspólny komponent** `LegalPageLayout.vue`,
  - 3 strony to tylko cienkie wrappery.

Obie opcje są poprawne; biorąc pod uwagę Twoją bazę, **polecałbym opcję B**: prostszy routing, ładne URL, mniejsza magia.

### SSR, SEO, canonical

- Strony prawne są SSR / SSG poprzez standardowy mechanizm Nuxt (i `@nuxt/content`).
- SEO:
  - `useSeoMeta` korzysta z `title` i `description` z frontmatter.
  - `og:title`, `og:description`, `og:type: 'website'` lub `article` (tu wystarczy `website`).
  - `canonical` ustawiany na `runtimeConfig.public.siteUrl + path` (frontmatter `path` jest jedynym źródłem prawdy).
- I18n:
  - jeśli dodasz wersje EN, możesz dopisać `hreflang` / `alternate` na podstawie `locale` + `slug`.

---

## 5) Layout i wygląd

### Wspólny layout legal pages

Cel: **maksymalna czytelność**, brak marketingu.

**Struktura komponentów:**

- `UPage` – root (spójny z resztą projektu).
- `UPageBody` lub `PageSection`:
  - ograniczona szerokość `max-w-3xl` / `max-w-4xl`, `mx-auto`, `px-4`).
  - tło zgodne z resztą (ciemny/jasny), bez gradientów z Contact/Hero.
- Wewnątrz:
  - nagłówek:
    - H1: `title`
    - krótkie lead/description pod nim.
    - informacja „Ostatnia aktualizacja: {updatedAt}”.
  - blok `prose` (np. Tailwind `prose` / `prose-invert`):
    - wszystkie nagłówki H2/H3/H4, listy, tabelki itp.
    - odstępy pionowe między sekcjami.

**Zasady UI:**

- **Linia długości tekstu**:
  - `max-w-[70ch]` dla bloku z treścią.
- **Typografia**:
  - H1 duży (2.5–3rem), H2 mniejszy, H3/H4 lekko wyróżnione.
  - paragrafy 1rem–1.05rem, wysokość linii 1.6–1.7.
- **Brak elementów rozpraszających**:
  - **brak CTA**, brak dużych ilustracji.
  - jedyne linki to odnośniki wewnątrz dokumentu (np. do sekcji cookies).
- **Tryb dark/light**:
  - zapewnić dobry kontrast (min WCAG AA),
  - w dark mode tło spokojne (np. jednolity ciemny).

---

## 6) SEO & dostępność

### SEO

- **Title / description**:
  - z frontmatter, fallback do sensownych wartości `Polityka prywatności | Nazwa firmy`).
- **Nagłówki**:
  - dokładnie jedno H1 (tytuł dokumentu),
  - H2 używane jako sekcje główne (np. „Zakres danych”, „Cele przetwarzania”, „Prawa użytkownika”),
  - H3/H4 w ramach poszczególnych sekcji.
- **Canonical**:
  - generowany z `path`.
- **Open Graph / Twitter**:
  - `og:type: 'website'`,
  - `og:title`, `og:description` z frontmatter,
  - opcjonalnie `og:image` z globalnego `appMeta`.

### Dostępność

- **Kontrast tekstu** – dopilnować, by:
  - w light: tekst ~#1f2933 na tle #f9fafb / #ffffff,
  - w dark: tekst #e5e7eb na tle ciemnoszarym.
- **Nawigacja nagłówkami**:
  - struktura H1–H2–H3 logiczna, bez przeskakiwania poziomów.
- **Focus**:
  - wszystkie linki w treści powinny mieć wyraźny focus outline (dziedziczone z globalnego systemu UI).

### [Schema.org](http://Schema.org) (opcjonalne)

- Dla każdej strony:
  - `@type: "WebPage"` z `isPartOf` → strona główna.
- Dodatkowo, jeśli chcesz:
  - `about` z krótkim opisem polityki,
  - `dateModified` z `updatedAt`.
- Nie ma potrzeby komplikowania `LegalService` byłby bardziej do opisu usługi prawnej niż strony polityki).

---

## 7) Integracja globalna

### Footer

- `content/app/footer.md` już ma pola:
  - `legal.privacyUrl`, `legal.termsUrl`, `legal.cookiesUrl`.
- Plan:
  - upewnić się, że wartości tych pól odpowiadają `path` z frontmatter legal pages `/polityka-prywatnosci`, `/regulamin`, `/polityka-cookies`).
  - stopka generuje linki bez twardych ścieżek w kodzie.

### Inne miejsca

- **Formularze**:
  - zawsze używać linków z `legal.termsUrl` / `legal.privacyUrl` (np. w treści labela checkboxa):
    - „Akceptuję regulamin” → `<ULink :to="footerConfig.legal.termsUrl">Regulamin</ULink>`.
- **Cookies banner** (future-proof):
  - przyciski „Dowiedz się więcej” → korzystają z `legal.cookiesUrl`.
- Dzięki temu:
  - jeśli kiedyś zmienisz ścieżkę lub nazwę pliku, **wystarczy zmiana w jednym miejscu w content** `path` i/lub `footer.md`), bez refaktoru kodu.

---

## 8) Przyszłość i utrzymanie

- **Aktualizacja bez deployu**:
  - treści w `content/legal/*.md` mogą być edytowane bez zmian w kodzie; w środowisku z edytorem CMS (Headless / Git-based) aktualizacja sprowadza się do commitu pliku.
- **Wielojęzyczność**:
  - struktura:
    - `content/legal/privacy-policy.md` (PL z `locale: 'pl'`),
    - `content/legal/en/privacy-policy.md` (EN z `locale: 'en'`).
  - router wybiera dokument na podstawie aktualnego `locale` + `legalKind`.
- **Wersjonowanie treści**:
  - `updatedAt` w frontmatter + ewentualnie:
    - pole `version` (np. „1.3”),
    - sekcja „Historia zmian” w dokumencie, jeśli potrzebna.
- **Reużywalność na innych projektach**:
  - ten sam system:
    - `LegalPageSchema`,
    - layout `LegalPageLayout`,
    - 3 markdowny z frontmatter,
    - linki w `footer.md`.
  - Po skopiowaniu do nowego projektu wystarczy:
    - zaktualizować nazwę firmy w frontmatter i `footer.md`,
    - przejrzeć treść prawną.

---

## 9) Checklist wdrożeniowy

- **Content & schema**
  - Dodać kolekcję `legal` w `content.config.ts` z `LegalPageSchema`.
  - Utworzyć `content/legal/privacy-policy.md`, `terms-of-service.md`, `cookies-policy.md` z ustalonym frontmatter.
  - (Opcjonalnie) dodać pole `version` i `updatedAt` do schematu.
- **Routing**
  - Wybrać wariant B (3 pliki `pages/polityka-*.vue`) lub A `pages/legal/[slug].vue`).
  - Zaimplementować pobieranie dokumentu `legal` po `legalKind` / `slug`.
  - Skonfigurować `canonical` z `path`.
- **Layout**
  - Stworzyć wspólny komponent `LegalPageLayout` oparty na `UPageUPageBody` (lub `PageSection`).
  - Ograniczyć szerokość tekstu `max-w-3xl/4xl`, `mx-auto`).
  - Dodać blok `prose` dla treści markdown.
- **SEO & a11y**
  - Podpiąć `useSeoMeta` do `titledescription` z frontmatter.
  - Upewnić się, że jest dokładnie jedno H1.
  - Zadbaj o kontrast i focus dla linków.
  - (Opcjonalnie) dodać prosty `WebPage` [Schema.org](http://Schema.org).
- **Integracja globalna**
  - Ustawić w `content/app/footer.md` wartości `privacyUrl`, `termsUrl`, `cookiesUrl` zgodne z frontmatter `path`.
  - W miejscach wymagających linku do regulaminu / polityki, korzystać z danych z `useFooterConfig()`.
- **Future-proof**
  - Dodać pole `locale` do schemy i plików.
  - Przygotować strukturę `content/legal/en/*` pod wersje EN.
  - (Opcjonalnie) zdefiniować konwencję aktualizacji `updatedAt` (ręcznie lub przez skrypt)
