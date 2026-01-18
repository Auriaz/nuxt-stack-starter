---
name: Strona kontaktowa oparta o Content Layer
overview: ''
todos: []
---

# Strona kontaktowa oparta o Content Layer i Page Builder

## Analiza obecnego stanu

### Obecna strona kontaktowa (`app/pages/kontakt.vue`):

- Hardcoded content (hero, informacje kontaktowe, formularz)
- Formularz używa `ContactFormSchema` z `shared/schemas/api.ts`
- Endpoint `/api/contact.post.ts` już istnieje
- Nie używa Content Layer ani page builder
- Nie jest konfigurowalna z plików `.md`

### Dostępne zasoby:

- `ContactFormSchema` w `shared/schemas/api.ts`
- Endpoint `server/api/contact.post.ts` (placeholder)
- Composable `useForm` w `app/composables/useForm.ts`
- `SectionsRenderer` z obsługą sekcji
- Wzorce z `index.vue`, `oferta.vue`, `o-nas.vue`

## Plan implementacji

### 1. Nowe schematy sekcji

**Plik:** `shared/schemas/sections.ts`

Dodaj trzy nowe schematy sekcji:

#### A) SectionContactDetailsSchema

```typescript
export const SectionContactDetailsSchema = object({
  type: literal('contact-details'),
  // ... pola z SectionBaseSchema (id, enabled, title, description, align, etc.)
  props: object({
    variant: optional(picklist(['cards', 'list'] as const)),
    items: array(
      object({
        label: string(),
        value: string(),
        href: optional(string()),
        icon: optional(string()),
        note: optional(string()),
      })
    ),
  }),
})
```

#### B) SectionContactFormSchema

```typescript
export const SectionContactFormSchema = object({
  type: literal('contact-form'),
  // ... pola z SectionBaseSchema
  props: object({
    endpoint: optional(string()), // default: '/api/contact'
    method: optional(picklist(['POST'] as const)),
    fields: array(
      object({
        name: string(), // 'name' | 'email' | 'phone' | 'subject' | 'message' | 'company'
        label: string(),
        type: optional(picklist(['text', 'email', 'tel', 'textarea'] as const)),
        required: optional(boolean()),
        placeholder: optional(string()),
        icon: optional(string()),
      })
    ),
    consent: optional(
      object({
        label: string(),
        required: optional(boolean()),
      })
    ),
    successMessage: optional(string()),
    errorMessage: optional(string()),
    spamProtection: optional(
      object({
        type: optional(picklist(['honeypot', 'turnstile'] as const)),
        // config only, bez implementacji
      })
    ),
  }),
})
```

#### C) SectionMapSchema

```typescript
export const SectionMapSchema = object({
  type: literal('map'),
  // ... pola z SectionBaseSchema
  props: object({
    type: picklist(['embed', 'link'] as const),
    embedUrl: optional(string()),
    linkUrl: optional(string()),
    addressText: optional(string()),
    note: optional(string()),
  }),
})
```

**Aktualizacja `SectionSchema` (variant):**

- Dodaj `'contact-details'`, `'contact-form'`, `'map'` do `SectionBaseSchema.type`
- Dodaj nowe schematy do `SectionSchema` (variant)

### 2. Typy TypeScript

**Plik:** `shared/types/sections.ts`

Dodaj typy:

- `SectionContactDetails` - InferOutput z `SectionContactDetailsSchema`
- `SectionContactForm` - InferOutput z `SectionContactFormSchema`
- `SectionMap` - InferOutput z `SectionMapSchema`
- Zaktualizuj `Section` (discriminated union) o nowe typy

### 3. Composable useContactForm

**Plik:** `app/composables/useContactForm.ts` (nowy)

```typescript
export interface ContactFormOptions {
  endpoint?: string
  method?: 'POST'
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

export function useContactForm(options?: ContactFormOptions) {
  const isSubmitting = ref(false)
  const isSubmitted = ref(false)
  const submitError = ref<string | null>(null)
  const toast = useToast()

  const submit = async (data: ContactFormRequest) => {
    isSubmitting.value = true
    submitError.value = null

    try {
      const response = await $fetch<{ success: boolean; message?: string }>(
        options?.endpoint || '/api/contact',
        {
          method: options?.method || 'POST',
          body: data,
        }
      )

      if (response.success) {
        isSubmitted.value = true
        options?.onSuccess?.(response)
        toast.add({
          title: 'Sukces',
          description: response.message || 'Wiadomość została wysłana pomyślnie.',
          color: 'success',
        })
      } else {
        throw new Error(response.message || 'Wystąpił błąd podczas wysyłania formularza')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania formularza'
      submitError.value = errorMessage
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage))
      toast.add({
        title: 'Błąd',
        description: errorMessage,
        color: 'error',
      })
    } finally {
      isSubmitting.value = false
    }
  }

  const reset = () => {
    isSubmitted.value = false
    submitError.value = null
  }

  return {
    isSubmitting,
    isSubmitted,
    submitError,
    submit,
    reset,
  }
}
```

**Uwagi architektoniczne:**

- Composable jest abstrakcją nad `$fetch` - łatwa podmiana na backend API
- W przyszłości może być rozszerzony o rate limiting, captcha, logowanie do DB
- Nie zawiera logiki biznesowej (tylko transport danych)

### 4. Komponenty sekcji

#### A) SectionsContactDetails.vue

**Plik:** `app/components/sections/ContactDetails/SectionsContactDetails.vue` (nowy)

- Renderuje kafelki/listę danych kontaktowych
- Warianty: `cards` (grid) lub `list` (vertical)
- Używa Nuxt UI: `UCard`, `UIcon`, `UBadge`
- Obsługuje `href` (mailto:, tel:, linki)

#### B) SectionsContactForm.vue

**Plik:** `app/components/sections/ContactForm/SectionsContactForm.vue` (nowy)

- Renderuje formularz na podstawie `props.fields[]`
- Używa Nuxt UI: `UForm`, `UFormField`, `UInput`, `UTextarea`, `UButton`
- Walidacja przez `ContactFormSchema` (dla pól zgodnych z schematem)
- Używa `useContactForm` composable
- Obsługuje `consent` (checkbox)
- Wyświetla komunikaty sukcesu/błędu (`UAlert`)
- Honeypot field (ukryty) jeśli `spamProtection.type === 'honeypot'`

**Mapowanie pól:**

- `name`, `email`, `phone`, `subject`, `message` → zgodne z `ContactFormSchema`
- Inne pola (np. `company`) → opcjonalne, bez walidacji schema

#### C) SectionsMap.vue

**Plik:** `app/components/sections/Map/SectionsMap.vue` (nowy)

- Wariant `embed`: `<iframe>` z `embedUrl` (Google Maps, OpenStreetMap)
- Wariant `link`: `UButton` z linkiem do mapy + `addressText`
- Responsywny iframe (aspect-ratio)

### 5. Aktualizacja SectionsRenderer

**Plik:** `app/components/sections/SectionsRenderer.vue`

Dodaj obsługę nowych sekcji:

```vue
<!-- Contact Details Section -->
<SectionsContactDetails
  v-else-if="section.type === 'contact-details'"
  :section="section"
  :base="getSectionBase(section)"
  :props="section.props"
/>

<!-- Contact Form Section -->
<SectionsContactForm
  v-else-if="section.type === 'contact-form'"
  :section="section"
  :base="getSectionBase(section)"
  :props="section.props"
/>

<!-- Map Section -->
<SectionsMap
  v-else-if="section.type === 'map'"
  :section="section"
  :base="getSectionBase(section)"
  :props="section.props"
/>
```

### 6. Schema.org dla strony kontaktowej

**Plik:** `app/pages/kontakt.vue`

Dodaj Schema.org:

- **ContactPage** - bazowy typ dla strony kontaktowej
- **Organization** - dane firmy z `app.meta.ts` (nazwa, email, adres, telefon)
- Opcjonalnie **LocalBusiness** - jeśli jest adres stacjonarny

```typescript
const contactSchema = computed(() => {
  const appMeta = useAppMeta()

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: page.value?.title || 'Kontakt',
    description: page.value?.description,
    mainEntity: {
      '@type': 'Organization',
      name: appMeta.name,
      email: appMeta.contactEmail,
      url: appMeta.url,
      // address, telephone jeśli dostępne
    },
  }
})

if (contactSchema.value) {
  useSchemaOrg([contactSchema.value])
}
```

### 7. Content Layer - kontakt.md

**Plik:** `content/kontakt.md` (nowy)

Przykładowa konfiguracja:

```yaml
---
title: 'Kontakt'
description: 'Skontaktuj się z nami. Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'
to: '/kontakt'
seo:
  title: 'Kontakt - Nuxt Base Starter'
  description: 'Skontaktuj się z nami. Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'
  image: '/images/og-image.png'
sections:
  # Hero
  - type: 'hero'
    id: 'hero'
    title: 'Skontaktuj się z nami'
    description: 'Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'centered'
      variant: 'primary'

  # Contact Details
  - type: 'contact-details'
    id: 'contact-details'
    title: 'Informacje kontaktowe'
    description: 'Jesteśmy dostępni od poniedziałku do piątku w godzinach 9:00-17:00.'
    align: 'left'
    spacing: 'lg'
    props:
      variant: 'cards'
      items:
        - label: 'Email'
          value: 'kontakt@example.com'
          href: 'mailto:kontakt@example.com'
          icon: 'i-lucide-mail'
        - label: 'Telefon'
          value: '+48 123 456 789'
          href: 'tel:+48123456789'
          icon: 'i-lucide-phone'
        - label: 'Adres'
          value: 'ul. Przykładowa 123\n00-000 Warszawa\nPolska'
          icon: 'i-lucide-map-pin'
        - label: 'Godziny pracy'
          value: 'Pon-Pt: 9:00-17:00'
          icon: 'i-lucide-clock'

  # Contact Form
  - type: 'contact-form'
    id: 'contact-form'
    title: 'Wyślij wiadomość'
    description: 'Wypełnij formularz, a skontaktujemy się z Tobą jak najszybciej.'
    align: 'left'
    spacing: 'lg'
    props:
      endpoint: '/api/contact'
      method: 'POST'
      fields:
        - name: 'name'
          label: 'Imię i nazwisko'
          type: 'text'
          required: true
          placeholder: 'Jan Kowalski'
          icon: 'i-lucide-user'
        - name: 'email'
          label: 'Email'
          type: 'email'
          required: true
          placeholder: 'jan.kowalski@example.com'
          icon: 'i-lucide-mail'
        - name: 'phone'
          label: 'Telefon (opcjonalnie)'
          type: 'tel'
          required: false
          placeholder: '+48 123 456 789'
          icon: 'i-lucide-phone'
        - name: 'subject'
          label: 'Temat'
          type: 'text'
          required: true
          placeholder: 'Temat wiadomości'
          icon: 'i-lucide-tag'
        - name: 'message'
          label: 'Wiadomość'
          type: 'textarea'
          required: true
          placeholder: 'Twoja wiadomość...'
      consent:
        label: 'Wyrażam zgodę na przetwarzanie danych osobowych'
        required: true
      successMessage: 'Wiadomość została wysłana pomyślnie. Skontaktujemy się z Tobą wkrótce.'
      errorMessage: 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.'

  # Map (opcjonalnie)
  - type: 'map'
    id: 'map'
    title: 'Lokalizacja'
    spacing: 'lg'
    props:
      type: 'embed'
      embedUrl: 'https://www.google.com/maps/embed?pb=...'
      addressText: 'ul. Przykładowa 123, 00-000 Warszawa'
      note: 'Znajdź nas na mapie'

  # FAQ (opcjonalnie)
  - type: 'faq'
    id: 'faq'
    title: 'Często zadawane pytania'
    description: 'Odpowiedzi na najczęstsze pytania dotyczące kontaktu i współpracy.'
    align: 'center'
    spacing: 'lg'
    props:
      items:
        - question: 'Jak szybko odpowiadacie na wiadomości?'
          answer: 'Odpowiadamy na wszystkie wiadomości w ciągu 24 godzin w dni robocze.'
        - question: 'Czy oferujecie konsultacje?'
          answer: 'Tak, oferujemy bezpłatne konsultacje dla nowych projektów.'

  # CTA
  - type: 'cta'
    id: 'cta'
    title: 'Masz pytania?'
    description: 'Skontaktuj się z nami już dziś i dowiedz się, jak możemy pomóc.'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'centered'
      actions:
        - label: 'Skontaktuj się'
          to: '#contact-form'
          color: 'primary'
          variant: 'solid'
---
```

### 8. Refaktoryzacja strony kontaktowej

**Plik:** `app/pages/kontakt.vue`

Zastąp hardcoded content przez Content Layer:

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
  const appMeta = useAppMeta()

  // Pobierz konfigurację strony z content/kontakt.md
  const { data: page } = await useAsyncData('contact-page', () =>
    queryCollection<PageEntry>('pages').path(path).first()
  )

  // Pobierz sekcje z page
  const sections = computed(() => {
    if (!page.value) return []
    return getPageSections(page.value)
  })

  // Schema.org
  const contactSchema = computed(() => {
    if (!page.value) return null

    return {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: page.value.title,
      description: page.value.description,
      mainEntity: {
        '@type': 'Organization',
        name: appMeta.name,
        email: appMeta.contactEmail,
        url: appMeta.url,
        sameAs: appMeta.sameAs,
      },
    }
  })

  if (contactSchema.value) {
    useSchemaOrg([contactSchema.value])
  }

  // SEO Meta
  useSeoMeta({
    title: page.value?.seo?.title || page.value?.title || 'Kontakt',
    description:
      page.value?.seo?.description || page.value?.description || 'Skontaktuj się z nami.',
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

### 9. Dokumentacja

**Plik:** `docs/CONTACT_PAGE.m
