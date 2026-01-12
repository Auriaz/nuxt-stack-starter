---
name: Integracja shared schemas/types/utils w aplikacji
overview: Plan integracji shared/schemas, shared/types i shared/utils w istniejących plikach aplikacji, eliminując duplikację i zapewniając spójność typów.
todos: []
---

# Integracja shared schemas/types/utils w aplikacji

## 1. Analiza obecnego stanu

### 1.1 Zidentyfikowane duplikacje i możliwości integracji

**Duplikacja schematów:**

- `app/pages/kontakt.vue` - schema Valibot inline (linie 21-39)
- `server/api/contact.post.ts` - identyczny schema inline (linie 3-21)
- Oba powinny używać tego samego schema z `shared/schemas/api.ts`

**Nieużywane typy:**

- `app/composables/useSeo.ts` - własny interfejs `PageSeoMeta` zamiast typu `SEO` z `shared/types/common.ts`
- Wszystkie strony używają `useSeoMeta` bezpośrednio zamiast `usePageSeo` z typami

**Nieużywane utils:**

- `app/pages/blog/index.vue` - formatowanie daty inline (linia 39)
- `app/pages/blog/[slug].vue` - formatowanie daty inline (linia 59)
- Oba powinny używać `formatDateShort` z `shared/utils/content.ts`

**Potencjalne usprawnienia:**

- `app/composables/useForm.ts` - można rozważyć integrację z Valibot (opcjonalne)

## 2. Miejsca integracji

### 2.1 Schemas - Contact Form

**Lokalizacja:** `shared/schemas/api.ts`

**Aktualizacja:**

- Dodać `ContactFormSchema` do `shared/schemas/api.ts`
- Dodać typ `ContactFormRequest` do `shared/types/api.ts`

**Użycie w:**

- `app/pages/kontakt.vue` - import schema zamiast inline
- `server/api/contact.post.ts` - import schema zamiast inline

### 2.2 Types - SEO

**Lokalizacja:** `shared/types/common.ts` (już istnieje `SEO`)

**Aktualizacja:**

- Rozszerzyć `SEOSchema` w `shared/schemas/common.ts` o dodatkowe pola używane w `useSeo.ts`
- Zaktualizować `useSeo.ts` aby używał typu `SEO` zamiast własnego interfejsu

**Użycie w:**

- `app/composables/useSeo.ts` - zastąpić `PageSeoMeta` typem `SEO`
- Wszystkie strony używające `usePageSeo` automatycznie zyskają typy

### 2.3 Utils - Formatowanie dat

**Lokalizacja:** `shared/utils/content.ts` (już istnieje `formatDateShort`)

**Użycie w:**

- `app/pages/blog/index.vue` - zastąpić inline formatowanie daty
- `app/pages/blog/[slug].vue` - zastąpić inline formatowanie daty

### 2.4 Types - BlogPost

**Lokalizacja:** `shared/types/content.ts` (już istnieje `BlogPostEntry`)

**Status:** Już używane w `app/pages/blog/index.vue` i `[slug].vue` ✓

## 3. Szczegółowy plan implementacji

### 3.1 Contact Form Schema

**Krok 1: Utworzyć ContactFormSchema**

Plik: `shared/schemas/api.ts`

```typescript
// Dodać do istniejącego pliku
export const ContactFormSchema = object({
  name: pipe(string(), minLength(2, 'Imię i nazwisko musi mieć co najmniej 2 znaki')),
  email: pipe(string(), email('Nieprawidłowy adres email')),
  phone: optional(string()),
  subject: pipe(string(), minLength(3, 'Temat musi mieć co najmniej 3 znaki')),
  message: pipe(string(), minLength(10, 'Wiadomość musi mieć co najmniej 10 znaków')),
})
```

**Krok 2: Dodać typ ContactFormRequest**

Plik: `shared/types/api.ts`

```typescript
// Dodać do istniejącego pliku
import { ContactFormSchema } from '../schemas/api'

export type ContactFormRequest = InferInput<typeof ContactFormSchema>
```

**Krok 3: Zaktualizować kontakt.vue**

Plik: `app/pages/kontakt.vue`

- Usunąć inline schema (linie 21-39)
- Importować `ContactFormSchema` z `shared/schemas/api`
- Użyć typu `ContactFormRequest` zamiast `Schema`

**Krok 4: Zaktualizować contact.post.ts**

Plik: `server/api/contact.post.ts`

- Usunąć inline schema (linie 3-21)
- Importować `ContactFormSchema` z `shared/schemas/api`
- Użyć tego samego schema do walidacji

### 3.2 SEO Types

**Krok 1: Rozszerzyć SEOSchema**

Plik: `shared/schemas/common.ts`

```typescript
// Rozszerzyć istniejący SEOSchema
export const SEOSchema = object({
  title: optional(string()),
  description: optional(string()),
  image: optional(string()),
  // Dodatkowe pola używane w useSeo.ts
  noindex: optional(boolean()),
  ogType: optional(picklist(['website', 'article', 'profile'] as const)),
  publishedTime: optional(string()),
  modifiedTime: optional(string()),
  author: optional(string()),
  tags: optional(array(string())),
})
```

**Krok 2: Zaktualizować useSeo.ts**

Plik: `app/composables/useSeo.ts`

- Usunąć interfejs `PageSeoMeta`
- Importować typ `SEO` z `shared/types/common`
- Zmienić parametr funkcji z `PageSeoMeta` na `SEO`

**Krok 3: Zaktualizować strony używające usePageSeo**

Pliki: wszystkie strony używające `usePageSeo` automatycznie zyskają typy

### 3.3 Formatowanie dat

**Krok 1: Zaktualizować blog/index.vue**

Plik: `app/pages/blog/index.vue`

- Zastąpić inline formatowanie (linia 39) wywołaniem `formatDateShort(post.date)`
- Import nie jest potrzebny (auto-import z `shared/utils`)

**Krok 2: Zaktualizować blog/[slug].vue**

Plik: `app/pages/blog/[slug].vue`

- Zastąpić inline formatowanie (linia 59) wywołaniem `formatDateShort(post.date)`
- Import nie jest potrzebny (auto-import z `shared/utils`)

### 3.4 Opcjonalne: Integracja useForm z Valibot

**Uwaga:** To jest większa zmiana, która może wymagać refaktoringu. Można to zrobić w przyszłości.

**Pomysł:**

- Rozważyć dodanie opcji `schema?: ValibotSchema` do `useForm`
- Automatyczna walidacja używając Valibot zamiast custom rules
- Zachować backward compatibility z obecnym API

## 4. Przepływ danych po integracji

```
User Input (kontakt.vue)
    ↓
ContactFormSchema (shared/schemas/api.ts)
    ↓
Validated Data (runtime)
    ↓
ContactFormRequest Type (shared/types/api.ts)
    ↓
API Request (server/api/contact.post.ts)
    ↓
ContactFormSchema (ponowna walidacja)
```

## 5. Korzyści z integracji

1. **Eliminacja duplikacji** - jeden schema dla formularza kontaktowego
2. **Type safety** - spójne typy między frontend a backend
3. **Maintainability** - zmiany w jednym miejscu
4. **Reużywalność** - utils dostępne wszędzie przez auto-import
5. **Spójność** - wszystkie strony używają tych samych typów SEO

## 6. Checklist implementacji

- [ ] Dodać `ContactFormSchema` do `shared/schemas/api.ts`
- [ ] Dodać `ContactFormRequest` do `shared/types/api.ts`
- [ ] Zaktualizować `app/pages/kontakt.vue` - użyć schema z shared
- [ ] Zaktualizować `server/api/contact.post.ts` - użyć schema z shared
- [ ] Rozszerzyć `SEOSchema` w `shared/schemas/common.ts` o dodatkowe pola
- [ ] Zaktualizować `app/composables/useSeo.ts` - użyć typu `SEO` zamiast `PageSeoMeta`
- [ ] Zaktualizować `app/pages/blog/index.vue` - użyć `formatDateShort`
- [ ] Zaktualizować `app/pages/blog/[slug].vue `- użyć `formatDateShort`
- [ ] Zweryfikować, że wszystkie strony używające `usePageSeo` działają poprawnie
- [ ] Przetestować formularz kontaktowy po zmianach

## 7. Pliki do modyfikacji

**Nowe eksporty w istniejących plikach:**

- `shared/schemas/api.ts` - dodać `ContactFormSchema`
- `shared/types/api.ts` - dodać `ContactFormRequest`

**Modyfikowane pliki:**

- `shared/schemas/common.ts` - rozszerzyć `SEOSchema`
- `app/composables/useSeo.ts` - użyć typu `SEO`
- `app/pages/kontakt.vue` - użyć `ContactFormSchema`
- `server/api/contact.post.ts` - użyć `ContactFormSchema`
- `app/pages/blog/index.vue` - użyć `formatDateShort`
- `app/pages/blog/[slug].vue `- użyć `formatDateShort`

## 8. Uwagi techniczne

### 8.1 Auto-importy

- Utils z `shared/utils/` są już skonfigurowane w `nuxt.config.ts` (imports.dirs)
- Nie trzeba dodawać explicit imports dla utils
- Schemas i types wymagają explicit imports (nie są auto-importowane)

### 8.2 Backward compatibility

- Zmiany w `useSeo.ts` są backward compatible (tylko zmiana typu parametru)
- Zmiany w formularzu kontaktowym są transparentne dla użytkownika
- Formatowanie dat - tylko refaktoring kodu, funkcjonalność bez zmian

### 8.3 Testowanie

- Przetestować formularz kontaktowy (walidacja, wysyłanie)
- Przetestować strony bloga (formatowanie dat)
- Przetestować SEO na wszystkich stronach
- Sprawdzić TypeScript errors po zmianach
