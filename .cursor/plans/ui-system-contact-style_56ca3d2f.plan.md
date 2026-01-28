---
name: ui-system-contact-style
overview: Spójny system UI/UX + motion oparty o styl ContactForm, zapisany w `.cursor/remember.md` i wdrożony w sekcjach marketingowych (hero, features, cta) w całej aplikacji.
todos:
  - id: ui-guidelines-remember
    content: Dodać sekcję UI System (ContactForm-style) do .cursor/remember.md z klasami Tailwind i zasadami.
    status: completed
  - id: motion-presets
    content: Zdefiniować presety motion-v (enter, card, list, alert, button) i zasady użycia.
    status: completed
  - id: standardize-sections
    content: Ujednolicić sekcje marketingowe (Hero/Features/CTA) wg nowych guidelines.
    status: completed
  - id: card-form-standard
    content: Zastosować kanoniczny UCard/form pattern w marketingowych sekcjach.
    status: completed
isProject: false
---

# System UI/UX + Motion (ContactForm‑style)

## Kontekst i punkt odniesienia

Wzorzec stylu to `ContactForm.vue` – jego layout, typografia, karty, formularze i alerty będą bazą dla systemu. Najważniejsze cechy do ujednolicenia to: grid 2‑kolumnowy (1.1fr/1fr), label uppercase z dużym trackingiem, nagłówki z gradientowym akcentem, lekkie karty `UCard` z półprzezroczystym tłem i delikatnym shadow, stonowane kolory tekstu oraz `UAlert` jako feedback. Referencja: `[app/components/Contact/Form/ContactForm.vue](app/components/Contact/Form/ContactForm.vue)`.

## Plan wdrożenia

### 1) Sformalizuj design guidelines w `.cursor/remember.md`

- Dopisz sekcję „UI System (ContactForm‑style)” z:
  - Layout & spacing (sekcje, grid, rytm pionowy)
  - Typografię (roles + klasy Tailwind)
  - Karty `UCard` (jedna kanoniczna konfiguracja)
  - Formularze (label + input + spacing)
  - Alerty (success/error) i przyciski
  - Zasady użycia gradientów i kontrastu
- Przykładowe klasy i reguły powinny być literalne (Tailwind), np. label: `text-xs uppercase tracking-[0.25em] text-primary` i heading: `text-3xl md:text-4xl font-semibold tracking-tight` – zgodnie z ContactForm.

### 2) Zdefiniuj standardy layoutu sekcji marketingowych

- Oprzyj layout sekcji na `PageSection` + `UPageSection` pattern (jak w `SectionsHero/CTA`).
- Ustal 2‑kolumnowy grid dla sekcji marketingowych (desktop) i stack (mobile), np. `grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]`.
- Ustandaryzuj `space-y` i `py` dla sekcji (np. `py-12 md:py-16` + `space-y-6/8`).

### 3) Ustandaryzuj typografię

- Role tekstu i klasy:
  - Section label: `text-xs md:text-sm uppercase tracking-[0.25em] text-primary`
  - H1 marketing: `text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight`
  - H2 sekcji: `text-2xl md:text-3xl font-semibold tracking-tight`
  - H3 w kartach: `text-lg font-semibold`
  - Body: `text-sm md:text-base text-gray-500 dark:text-gray-400`
  - Meta: `text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400`
- Gradient tylko jako akcent w nagłówku: `bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent`.

### 4) Kanoniczny styl `UCard`

- Wprowadź jedną „kanoniczną” konfigurację karty (zgodną z ContactForm):
  - `class`: `border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-gray-900/60 dark:border-gray-800`
  - `ui.body`: `p-6 md:p-7 space-y-5`
- Zastosuj te same ustawienia w boxach informacyjnych, CTA, sekcjach feature i formularzach auth.

### 5) System formularzy

- Każde pole:
  - wrapper: `space-y-1`
  - label: `block text-sm font-medium`
  - input: `UInput` / `UTextarea` bez custom CSS
- Sekcja akcji:
  - `UButton` (primary, `size="lg"`, `block`, `:loading`) + `UAlert` success/error (`variant="soft"`).

### 6) Motion system (motion‑v)

- Presety oparte wyłącznie o `opacity` + `translateY`.
- Wspólny timing (krótko, subtelnie): `duration 0.25–0.4s`, `easeOut`.
- Respektuj `prefers-reduced-motion` (bez animacji, jeśli włączone).
- Presety:
  - `sectionEnter`: opacity 0→1, y 12→0
  - `cardEnter`: opacity 0→1, y 8→0
  - `listStagger`: delay 60–80ms między elementami
  - `alertAppear`: opacity 0→1, y 6→0
  - `buttonHover`: minimalny `scale: 1.01` / `y: -1` (opcjonalnie)

### 7) Wdrożenie w UI – zakres: sekcje marketingowe

- Zastosuj system w sekcjach:
  - `SectionsHero.vue`
  - `SectionsFeatures.vue`
  - `SectionsCTA.vue`
- Ujednolić typografię, spacing, styl kart i micro‑UX w tych sekcjach.
- Upewnić się, że sekcje używają tych samych klas co ContactForm.

### 8) Przykłady do dokumentacji (do `.cursor/remember.md`)

- Krótkie snippet‑style przykłady:
  - sekcja contentowa (label + H2 + opis + grid)
  - formularz (pole + button + alert)
  - karta info (UCard z body spacing)

## Krytyczne miejsca do modyfikacji

- `[app/components/Contact/Form/ContactForm.vue](app/components/Contact/Form/ContactForm.vue)` – źródło stylu.
- `[app/components/Sections/Hero/SectionsHero.vue](app/components/Sections/Hero/SectionsHero.vue)`
- `[app/components/Sections/Features/SectionsFeatures.vue](app/components/Sections/Features/SectionsFeatures.vue)`
- `[app/components/Sections/CTA/SectionsCTA.vue](app/components/Sections/CTA/SectionsCTA.vue)`
- `[.cursor/remember.md](.cursor/remember.md)` – dokumentacja systemu.

## Uzgodnione zakresy

- Implementacja: pełna (plan + zapis do `.cursor/remember.md` + wdrożenie w UI).
- Zakres UI: sekcje marketingowe (hero, features, cta) w całym serwisie.
