---
name: Refaktoryzacja strony oferta do page builder
overview: Przekształcenie strony oferta z hardcoded komponentów na data-driven page builder używający SectionsRenderer, dodanie sekcji pricing do systemu oraz aktualizacja content/oferta.md.
todos: []
---

# Refaktoryzacja strony oferta do page builder

## Analiza obecnego stanu

### Problemy:

1.  **`app/pages/oferta.vue`**:

                        - Używa hardcoded komponentów (`SectionsPricing`, `SectionsFAQ`) bez props
                        - Ma hardcoded header sekcję zamiast używać page builder
                        - Nie używa `SectionsRenderer` i systemu page builder
                        - Używa `offerPage.value?.title` ale nie ma typu `PageEntry`

2.  **`content/oferta.md`**:

                        - Ma tylko podstawowy frontmatter
                        - Brak sekcji w formacie page builder

3.  **Brak sekcji pricing w systemie**:

                        - Nie ma `SectionPricingSchema` w `shared/schemas/sections.ts`
                        - Nie ma `SectionsPricing.vue` zgodnego z nowym systemem (jest tylko stary `Pricing.vue`)
                        - Brak obsługi pricing w `SectionsRenderer.vue`

## Plan implementacji

### 1. Dodanie sekcji Pricing do schematu

**Plik:** `shared/schemas/sections.ts`

**Zmiany:**

- Dodać `SectionPricingSchema` po `SectionCTASchema`
- Schemat powinien zawierać: - `type: literal('pricing')` - Wszystkie pola z `SectionBaseFields` - `props` z: - `plans: array(object({ name, price, period?, description?, features: array(string), action: HeroActionSchema, popular?: boolean }))` - `layout?: 'grid' | 'table'`
- Dodać `SectionPricingSchema` do `SectionSchema` variant

**Przykład schematu:**

```typescript
export const SectionPricingSchema = object({
  ...SectionBaseFields,
  type: literal('pricing'),
  props: object({
    plans: array(
      object({
        name: string(),
        price: string(),
        period: optional(string()),
        description: optional(string()),
        features: array(string()),
        action: HeroActionSchema,
        popular: optional(boolean()),
      })
    ),
    layout: optional(picklist(['grid', 'table'] as const)),
  }),
})
```

### 2. Dodanie typu SectionPricing

**Plik:** `shared/types/sections.ts`

**Zmiany:**

- Dodać `export type SectionPricing = InferOutput<typeof SectionPricingSchema>`
- Dodać `SectionPricing` do discriminated union `Section`

### 3. Stworzenie komponentu SectionsPricing.vue

**Plik:** `app/components/sections/Pricing/SectionsPricing.vue` (nowy)

**Zmiany:**

- Utworzyć nowy komponent na podstawie istniejącego `Pricing.vue`
- Zaimplementować zgodnie z wzorcem innych sekcji: - Props: `section: SectionPricing`, `base: SectionBase`, `props: SectionPricing['props']` - Computed `config` łączący `base` i `props` - Użycie Nuxt UI komponentów (`UCard`, `UButton`, `UBadge`) - Obsługa `layout: 'grid' | 'table'` - Obsługa `popular` flag dla planów - Użycie `HeroActionSchema` dla akcji

**Struktura:**

- Header z `base.title` i `base.description`
- Grid/Table z planami z `props.plans`
- Każdy plan: nazwa, cena, okres, opis, lista features, przycisk CTA
- Badge "Najpopularniejszy" dla planów z `popular: true`

### 4. Dodanie obsługi pricing w SectionsRenderer

**Plik:** `app/components/sections/SectionsRenderer.vue`

**Zmiany:**

- Dodać import `SectionsPricing`
- Dodać warunek renderowania:

```vue
<!-- Pricing Section -->
<SectionsPricing
  v-else-if="section.type === 'pricing'"
  :section="section"
  :base="getSectionBase(section)"
  :props="section.props"
/>
```

### 5. Refaktoryzacja oferta.vue

**Plik:** `app/pages/oferta.vue`

**Zmiany:**

- Usunąć hardcoded header sekcję
- Usunąć bezpośrednie użycie `SectionsPricing` i `SectionsFAQ`
- Dodać import `PageEntry` i `getPageSections`
- Dodać `queryCollection<PageEntry>('pages')` z typem
- Dodać computed `sections` używający `getPageSections(offerPage.value)`
- Zastąpić cały template przez `UPage` + `UPageBody` + `SectionsRenderer` (jak w `index.vue`)

**Nowa struktura:**

```vue
<script setup lang="ts">
  import type { PageEntry } from '#shared/types/content'
  import { getPageSections } from '#shared/utils/sections'

  const { path } = useRoute()
  const { data: offerPage } = await useAsyncData('offer', () =>
    queryCollection<PageEntry>('pages').path(path).first()
  )

  const sections = computed(() => {
    if (!offerPage.value) return []
    return getPageSections(offerPage.value)
  })

  useSeoMeta({
    title: offerPage.value?.title || 'Oferta',
    description: offerPage.value?.description || 'Nasza oferta',
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

### 6. Aktualizacja content/oferta.md

**Plik:** `content/oferta.md`

**Zmiany:**

- Dodać `description` do frontmatter
- Dodać sekcje w formacie page builder: - Hero section (opcjonalnie, jeśli potrzebny header) - Pricing section z planami - FAQ section - CTA section (opcjonalnie)

**Przykład struktury:**

```yaml
---
title: Oferta
description: Nasza oferta - wybierz plan dopasowany do Twoich potrzeb
to: '/oferta'
sections:
 - type: 'hero'
    id: 'hero'
    title: 'Nasza oferta'
    description: 'Wybierz plan dopasowany do Twoich potrzeb'
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

 - type: 'pricing'
    id: 'pricing'
    title: 'Cennik'
    description: 'Wybierz plan dopasowany do Twoich potrzeb'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'grid'
      plans:
    - name: 'Podstawowy'
          price: '999'
          period: 'PLN'
          description: 'Idealny dla małych projektów'
          features:
      - 'Strona główna + 3 podstrony'
      - 'Responsywny design'
      - 'Podstawowe SEO'
      - 'Formularz kontaktowy'
      - 'Wsparcie email'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'neutral'
            variant: 'outline'
    - name: 'Standardowy'
          price: '2499'
          period: 'PLN'
          description: 'Najpopularniejszy wybór'
          popular: true
          features:
      - 'Wszystko z planu Podstawowy'
      - 'Do 10 podstron'
      - 'Zaawansowane SEO'
      - 'Blog'
      - 'Integracje zewnętrzne'
      - 'Priorytetowe wsparcie'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'primary'
            variant: 'solid'
    - name: 'Premium'
          price: '4999'
          period: 'PLN'
          description: 'Dla wymagających projektów'
          features:
      - 'Wszystko z planu Standardowy'
      - 'Nielimitowane podstrony'
      - 'E-commerce'
      - 'Panel administracyjny'
      - 'Dedykowane wsparcie'
      - 'Szkolenia'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'primary'
            variant: 'solid'

 - type: 'faq'
    id: 'faq'
    title: 'Często zadawane pytania'
    description: 'Odpowiedzi na najczęstsze pytania dotyczące oferty'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'accordion'
      items:
    - question: 'Jak wybrać odpowiedni plan?'
          answer: 'Wybierz plan w zależności od wielkości projektu i potrzeb. Plan Podstawowy jest idealny dla małych stron, Standardowy dla większości projektów, a Premium dla zaawansowanych rozwiązań.'
    - question: 'Czy mogę zmienić plan później?'
          answer: 'Tak, możesz zmienić plan w dowolnym momencie. Różnica w cenie zostanie rozliczona proporcjonalnie.'
    - question: 'Co zawiera wsparcie?'
          answer: 'Wsparcie obejmuje pomoc techniczną, aktualizacje i konsultacje. W planie Premium otrzymujesz dedykowane wsparcie z priorytetem.'

 - type: 'cta'
    id: 'cta'
    title: 'Gotowy na start?'
    description: 'Skontaktuj się z nami, aby omówić Twój projekt'
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

## Kolejność wykonania

1. Dodanie `SectionPricingSchema` do `sections.ts`
2. Dodanie typu `SectionPricing` do `types/sections.ts`
3. Stworzenie komponentu `SectionsPricing.vue`
4. Dodanie obsługi pricing w `SectionsRenderer.vue`
5. Refaktoryzacja `oferta.vue`
6. Aktualizacja `oferta.md` z sekcjami

## Oczekiwane rezultaty

- Strona oferta używa page builder (data-driven)
- Sekcja pricing jest częścią systemu page builder
- Wszystkie sekcje są konfigurowalne z content layer
- Spójność z `index.vue` (ten sam wzorzec)
- Możliwość edycji w Nuxt Studio
- Brak hardcoded komponentów
