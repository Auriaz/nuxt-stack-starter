---
name: Integracja shared/types i shared/utils z content.config.ts
overview: Zaprojektowanie spójnej architektury typów i utils w katalogu shared, zintegrowanej z Nuxt Content, skalowalnej dla auth, backendu i przyszłych rozszerzeń.
todos: []
---

# Integracja shared/types i shared/utils z content.config.ts

## 1. Kontekst: Jak Nuxt Content używa content.config.ts

### 1.1 Mechanizm działania

- `content.config.ts` definiuje kolekcje treści (collections) z schematami Valibot
- Schematy Valibot walidują frontmatter w plikach `.md`
- Typy TypeScript są wywnioskowane z schematów Valibot przez `InferOutput`
- Nuxt Content automatycznie typuje query results na podstawie schematów

### 1.2 Gdzie typy są istotne

- **Schemas**: Definicje walidacji dla frontmatter (Valibot)
- **Frontmatter**: Typy dla danych w plikach `.md`
- **Collections**: Typy dla wyników `queryCollection()` i `queryContent()`
- **Content entries**: Typy dla pojedynczych wpisów bloga/stron

### 1.3 Problem obecnej implementacji

- Schematy są zdefiniowane inline w `content.config.ts`
- Brak reużywalności między content, UI, backend
- Duplikacja definicji (np. `User` w `shared/types/user.ts` vs `authors` w `content.config.ts`)

## 2. Struktura katalogów shared

### 2.1 Rekomendowana struktura

```
shared/
├── types/
│   ├── index.ts                    # Centralny eksport wszystkich typów
│   ├── content.ts                   # Typy specyficzne dla Nuxt Content
│   ├── user.ts                      # User, Author (już istnieje)
│   ├── auth.ts                      # Role, Permission (przyszłość)
│   ├── common.ts                    # Wspólne typy (Image, SEO, etc.)
│   └── api.ts                       # DTO types dla API (przyszłość)
├── schemas/
│   ├── index.ts                     # Centralny eksport wszystkich schematów Valibot
│   ├── content.ts                   # Schematy dla Nuxt Content
│   ├── user.ts                      # UserSchema, AuthorSchema
│   ├── auth.ts                      # RoleSchema, PermissionSchema (przyszłość)
│   └── common.ts                    # ImageSchema, SEOSchema, etc.
└── utils/
    ├── index.ts                     # Centralny eksport utils
    ├── content.ts                   # Helpery dla content (formatDate, etc.)
    ├── validation.ts                # Wspólne walidacje Valibot
    └── types.ts                     # Type guards, type utilities
```

### 2.2 Uzasadnienie separacji schemas/types

- **Schemas (Valibot)**: Używane w runtime (walidacja, content.config.ts, API)
- **Types (TypeScript)**: Używane w compile-time (typowanie, IntelliSense)
- **Separacja**: Pozwala na różne wersje/transformacje (np. schema może mieć `optional()`, typ zawsze ma `| undefined`)

## 3. Konwencje nazewnictwa

### 3.1 Schematy Valibot

- Format: `{Entity}Schema` (np. `UserSchema`, `BlogPostSchema`)
- Eksport: `export const UserSchema = object({...})`
- Lokalizacja: `shared/schemas/{entity}.ts`

### 3.2 Typy TypeScript

- Format: `{Entity}` (np. `User`, `BlogPost`)
- Eksport: `export type User = InferOutput<typeof UserSchema>`
- Lokalizacja: `shared/types/{entity}.ts`

### 3.3 Utils

- Format: `{action}{Entity}` lub `{purpose}` (np. `formatDate`, `validateEmail`, `isUser`)
- Eksport: `export function formatDate(...)`
- Lokalizacja: `shared/utils/{purpose}.ts`

### 3.4 Granice odpowiedzialności

**shared/types:**

- ✅ Typy domenowe (User, Role, Permission)
- ✅ Typy dla Content (BlogPost, Author)
- ✅ Typy wspólne (Image, SEO, Metadata)
- ✅ Typy API/DTO
- ❌ Typy komponentów Vue (do `app/components`)
- ❌ Typy konfiguracyjne Nuxt (do `nuxt.config.ts`)

**shared/schemas:**

- ✅ Schematy Valibot dla walidacji
- ✅ Schematy dla Content frontmatter
- ✅ Schematy dla API request/response
- ❌ Logika biznesowa (do `server/` lub `app/composables`)

**shared/utils:**

- ✅ Pure functions (formatDate, slugify)
- ✅ Type guards (isUser, isValidEmail)
- ✅ Wspólne transformacje danych
- ❌ Composables Vue (do `app/composables`)
- ❌ Server utilities zależne od Nitro (do `server/utils`)

## 4. Integracja z content.config.ts

### 4.1 Strategia importów

- **Problem**: Auto-importy Nuxt nie działają w `content.config.ts` (to plik konfiguracyjny, nie runtime)
- **Rozwiązanie**: Używać explicit imports z `shared/schemas`

### 4.2 Przykładowa implementacja

**shared/schemas/common.ts:**

```typescript
import { object, string, optional } from 'valibot'

export const ImageSchema = object({
  url: string(),
  alt: optional(string()),
})

export const SEOSchema = object({
  title: optional(string()),
  description: optional(string()),
  image: optional(string()),
})
```

**shared/schemas/user.ts:**

```typescript
import { object, string, optional } from 'valibot'
import { ImageSchema } from './common'

export const AuthorSchema = object({
  name: string(),
  avatar: ImageSchema,
  description: optional(string()),
  email: optional(string()),
  to: optional(string()),
  target: optional(string()),
})
```

**shared/types/user.ts:**

```typescript
import type { InferOutput } from 'valibot'
import { AuthorSchema } from '../schemas/user'

export type Author = InferOutput<typeof AuthorSchema>
export type User = Author // Alias dla spójności, jeśli User = Author w kontekście content
```

**shared/schemas/content.ts:**

```typescript
import { object, string, date, array, optional } from 'valibot'
import { ImageSchema, SEOSchema } from './common'
import { AuthorSchema } from './user'

export const BlogPostSchema = object({
  title: string(),
  description: optional(string()),
  date: date(),
  image: ImageSchema,
  authors: optional(array(AuthorSchema))),
  tags: optional(array(string())),
  seo: optional(SEOSchema)
})
```

**content.config.ts:**

```typescript
import { defineContentConfig, defineCollection } from '@nuxt/content'
import { BlogPostSchema } from './shared/schemas/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: BlogPostSchema,
    }),
  },
})
```

### 4.3 Typowanie wyników Content queries

**shared/types/content.ts:**

```typescript
import type { InferOutput } from 'valibot'
import { BlogPostSchema } from '../schemas/content'

export type BlogPost = InferOutput<typeof BlogPostSchema>

// Typ dla wyników queryCollection('blog')
export type BlogPostEntry = BlogPost & {
  _path: string
  _id: string
  _type: string
}
```

**Użycie w komponencie:**

```typescript
// app/pages/blog/index.vue
import type { BlogPostEntry } from '~/shared/types/content'

const { data: posts } = await useAsyncData('blog', () =>
  queryCollection<BlogPostEntry>('blog').all()
)
```

## 5. Konfiguracja auto-importów

### 5.1 Nuxt.config.ts

Nuxt 4 automatycznie auto-importuje z:

- `app/composables/`
- `app/utils/`
- `server/utils/`

Dla `shared/` należy dodać konfigurację:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ...
  imports: {
    dirs: ['shared/types', 'shared/utils'],
  },
})
```

### 5.2 Index files dla eksportów

**shared/types/index.ts:**

```typescript
export * from './user'
export * from './content'
export * from './common'
// Przyszłość:
// export * from './auth'
// export * from './api'
```

**shared/utils/index.ts:**

```typescript
export * from './content'
export * from './validation'
export * from './types'
```

## 6. Przyszłe use-case'y

### 6.1 Autoryzacja (auth.ts)

**shared/schemas/auth.ts:**

```typescript
import { object, string, array, enum_ } from 'valibot'

export const RoleSchema = enum_(['admin', 'editor', 'author', 'viewer'])
export const PermissionSchema = enum_(['read', 'write', 'delete', 'publish'])

export const UserRoleSchema = object({
  userId: string(),
  role: RoleSchema,
  permissions: array(PermissionSchema),
})
```

**shared/types/auth.ts:**

```typescript
import type { InferInput, InferOutput } from 'valibot'
import { RoleSchema, PermissionSchema, UserRoleSchema } from '../schemas/auth'

export type Role = InferOutput<typeof RoleSchema>
export type Permission = InferOutput<typeof PermissionSchema>
export type UserRole = InferOutput<typeof UserRoleSchema>
```

### 6.2 Backend / API (api.ts)

**shared/schemas/api.ts:**

```typescript
import { object, string, number } from 'valibot'

export const CreatePostRequestSchema = object({
  title: string(),
  content: string(),
  authorId: string(),
})

export const PostResponseSchema = object({
  id: string(),
  title: string(),
  content: string(),
  authorId: string(),
  createdAt: string(),
})
```

**shared/types/api.ts:**

```typescript
import type { InferInput, InferOutput } from 'valibot'
import { CreatePostRequestSchema, PostResponseSchema } from '../schemas/api'

export type CreatePostRequest = InferInput<typeof CreatePostRequestSchema>
export type PostResponse = InferOutput<typeof PostResponseSchema>
```

### 6.3 Walidacja danych (schema-first)

**server/api/posts.post.ts:**

```typescript
import { CreatePostRequestSchema } from '~/shared/schemas/api'
import * as v from 'valibot'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const validatedData = v.parse(CreatePostRequestSchema, body)
  // ...
})
```

## 7. Dobre praktyki i pułapki

### 7.1 Dobre praktyki

1. **Zawsze eksportuj zarówno schema jak i type** - schema dla runtime, type dla compile-time
2. **Używaj centralnych index.ts** - ułatwia importy i refaktoryzację
3. **Separuj schemas od types** - pozwala na różne transformacje
4. **Dokumentuj złożone typy** - JSDoc dla skomplikowanych struktur
5. **Używaj InferInput dla request types** - różni się od InferOutput (np. optional fields)

### 7.2 Pułapki do unikania

1. **Nie mieszaj schemas z types w jednym pliku** - utrudnia zarządzanie
2. **Nie używaj auto-importów w content.config.ts** - wymaga explicit imports
3. **Nie duplikuj definicji** - jeden source of truth (schema)
4. **Nie umieszczaj logiki biznesowej w shared/** - tylko typy, schematy, pure utils
5. **Nie używaj `any` lub `unknown` bez type guards** - tracisz bezpieczeństwo typów

### 7.3 Type guards w shared/utils/types.ts

```typescript
import type { BlogPost } from '../types/content'
import { BlogPostSchema } from '../schemas/content'
import * as v from 'valibot'

export function isBlogPost(data: unknown): data is BlogPost {
  return v.is(BlogPostSchema, data)
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
```

## 8. Architektura długoterminowa

### 8.1 Zalety rozwiązania

- **Single Source of Truth**: Schematy Valibot są jedynym źródłem definicji
- **Type Safety**: Automatyczne typowanie z InferOutput
- **Skalowalność**: Łatwe dodawanie nowych typów bez refaktoringu
- **Reużywalność**: Te same schematy w Content, API, UI
- **Walidacja**: Runtime validation przez Valibot, compile-time przez TypeScript

### 8.2 Przepływ danych

```
Markdown frontmatter
    ↓
Valibot Schema (content.config.ts)
    ↓
Validated Data (runtime)
    ↓
TypeScript Type (InferOutput)
    ↓
Typed Component/API
```

### 8.3 Rozszerzalność

- **Nowe kolekcje**: Dodaj schema do `shared/schemas/content.ts`, użyj w `content.config.ts`
- **Nowe role**: Dodaj do `shared/schemas/auth.ts`, typy automatycznie dostępne
- **Nowe API endpoints**: Użyj istniejących schematów lub dodaj do `shared/schemas/api.ts`
- **Nowe utils**: Dodaj do `shared/utils/`, auto-import działa automatycznie

## 9. Checklist implementacji

- [ ] Utworzyć strukturę katalogów `shared/schemas/` i zaktualizować `shared/types/`
- [ ] Przenieść schematy z `content.config.ts` do `shared/schemas/content.ts`
- [ ] Utworzyć `shared/schemas/common.ts` (Image, SEO)
- [ ] Zaktualizować `shared/types/user.ts` aby używał schematów
- [ ] Utworzyć `shared/types/content.ts` z typami BlogPost
- [ ] Zaktualizować `content.config.ts` aby importował schematy
- [ ] Dodać `imports.dirs` w `nuxt.config.ts` dla auto-importów
- [ ] Utworzyć `shared/types/index.ts` i `shared/schemas/index.ts`
- [ ] Utworzyć `shared/utils/content.ts` z helperami
- [ ] Utworzyć `shared/utils/types.ts` z type guards
- [ ] Zaktualizować komponenty blog aby używały typów z `shared/types/content`
- [ ] Dodać przykładowe schematy dla auth (przyszłość)
- [ ] Dodać przykładowe schematy dla API (przyszłość)
- [ ] Zaktualizować dokumentację

## 10. Pliki do modyfikacji/utworzenia

**Nowe pliki:**

- `shared/schemas/index.ts`
- `shared/schemas/common.ts`
- `shared/schemas/content.ts`
- `shared/schemas/user.ts` (refaktor istniejącego)
- `shared/types/index.ts`
- `shared/types/content.ts`
- `shared/types/common.ts`
- `shared/utils/index.ts`
- `shared/utils/content.ts`
- `shared/utils/types.ts`

**Modyfikowane pliki:**

- `content.config.ts` - użycie schematów z shared
- `shared/types/user.ts` - użycie schematów z shared/schemas
- `nuxt.config.ts` - dodanie imports.dirs
- `app/pages/blog/index.vue` - użycie typów z shared/types/content
- `app/pages/blog/[slug].vue` - użycie typów z shared/types/content
