---
title: 'Auto-imports w Nuxt 4 - Magia automatycznych importów'
description: 'Poznaj jak Nuxt 4 automatycznie importuje komponenty, composables i utilities, eliminując potrzebę ręcznych importów i poprawiając Developer Experience.'
date: 2025-01-20
image:
  src: '/images/blog/auto-imports-nuxt-4.png'
  alt: 'Auto-imports w Nuxt 4'
tags:
  - 'Nuxt'
  - 'Auto-imports'
  - 'Developer Experience'
  - 'TypeScript'
  - 'Vue 3'
authors:
  - name: 'Adam Stankiewicz'
    avatar:
      src: 'https://avatars.githubusercontent.com/u/26349096?v=4'
      alt: 'Adam Stankiewicz'
    description: 'Full-stack web developer passionate about building robust Nuxt and Vue applications.'
    to: 'https://github.com/Auriaz'
    target: '_blank'
seo:
  title: 'Auto-imports w Nuxt 4 - Magia automatycznych importów'
  description: 'Poznaj jak Nuxt 4 automatycznie importuje komponenty, composables i utilities, eliminując potrzebę ręcznych importów i poprawiając Developer Experience.'
  ogType: 'article'
to: '/blog/auto-imports-nuxt-4'
anchors:
  - label: 'Blog'
    to: '/blog'
    icon: 'i-lucide-book'
    target: '_self'
---

# Auto-imports w Nuxt 4 - Magia automatycznych importów

Jedną z najbardziej imponujących funkcji Nuxt 4 jest system auto-importów, który automatycznie importuje komponenty, composables i utilities bez konieczności ręcznego dodawania importów. To nie tylko oszczędza czas, ale także znacząco poprawia Developer Experience.

## Czym są auto-imports?

Auto-imports to mechanizm, który automatycznie importuje funkcje, komponenty i inne elementy z określonych katalogów, pozwalając na ich bezpośrednie użycie w kodzie bez konieczności pisania `import`.

W tradycyjnym podejściu Vue.js musisz pisać:

```vue
<script setup>
  import { ref, computed } from 'vue'
  import MyComponent from '~/components/MyComponent.vue'
  import { useSeo } from '~/composables/useSeo'
</script>
```

W Nuxt 4 możesz po prostu użyć:

```vue
<script setup>
  const count = ref(0)
  const doubled = computed(() => count.value * 2)
</script>

<template>
  <MyComponent />
</template>
```

## Jak działają auto-imports w Nuxt 4?

Nuxt automatycznie skanuje określone katalogi i tworzy mapę wszystkich dostępnych elementów. Podczas kompilacji, Nuxt automatycznie dodaje odpowiednie importy tam, gdzie są używane.

### Katalogi auto-importowane

Nuxt 4 automatycznie importuje z następujących katalogów:

- **`app/composables/`** - Composables Vue (funkcje zaczynające się od `use`)
- **`app/components/`** - Komponenty Vue
- **`app/utils/`** - Funkcje pomocnicze
- **`server/utils/`** - Funkcje pomocnicze po stronie serwera
- **`shared/types/`** - Typy TypeScript (jeśli skonfigurowane)
- **`shared/utils/`** - Funkcje pomocnicze z katalogu shared (jeśli skonfigurowane)

### Przykład struktury

```
app/
├── composables/
│   ├── useSeo.ts        # Automatycznie dostępne jako useSeo()
│   └── useForm.ts       # Automatycznie dostępne jako useForm()
├── components/
│   ├── Button.vue       # Automatycznie dostępne jako <Button />
│   └── Card.vue         # Automatycznie dostępne jako <Card />
└── utils/
    └── formatDate.ts    # Automatycznie dostępne jako formatDate()
```

## Konfiguracja auto-imports

Możesz dostosować auto-imports w pliku `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  imports: {
    // Dodatkowe katalogi do auto-importu
    dirs: ['shared/types', 'shared/utils', 'composables/**'],

    // Globalne auto-importy (np. z bibliotek zewnętrznych)
    global: true,
  },
})
```

### Konfiguracja dla katalogu shared

W Nuxt 4 możesz łatwo skonfigurować auto-importy dla katalogu `shared/`:

```typescript
export default defineNuxtConfig({
  imports: {
    dirs: ['shared/types', 'shared/utils'],
  },
})
```

Dzięki temu wszystkie typy z `shared/types/` i funkcje z `shared/utils/` będą automatycznie dostępne w całej aplikacji.

## TypeScript support

Nuxt 4 automatycznie generuje typy dla auto-importowanych elementów. Wszystkie auto-importy są w pełni typowane, co zapewnia:

- **Autouzupełnianie** w edytorze
- **Sprawdzanie typów** podczas kompilacji
- **IntelliSense** w VS Code i innych edytorach

Typy są generowane w katalogu `.nuxt/` i automatycznie aktualizowane podczas rozwoju.

## Przykłady użycia

### Composables

```vue
<script setup lang="ts">
  // Nie musisz importować - Nuxt robi to automatycznie
  const { title, description } = useSeo({
    title: 'Moja strona',
    description: 'Opis strony',
  })

  const form = useForm({
    schema: ContactFormSchema,
  })
</script>
```

### Komponenty

```vue
<template>
  <!-- Komponenty są automatycznie dostępne -->
  <Button variant="primary">Kliknij mnie</Button>
  <Card>
    <CardHeader>Tytuł</CardHeader>
    <CardBody>Treść</CardBody>
  </Card>
</template>
```

### Utilities

```vue
<script setup lang="ts">
  // Funkcje pomocnicze są automatycznie dostępne
  const formattedDate = formatDateShort(new Date(), 'pl-PL')
  const isValid = isValidEmail('test@example.com')
</script>
```

## Best practices

### 1. Konwencje nazewnictwa

- **Composables**: Zaczynaj od `use` (np. `useSeo`, `useForm`)
- **Components**: Używaj PascalCase (np. `Button.vue`, `Card.vue`)
- **Utils**: Używaj camelCase (np. `formatDate.ts`, `isValidEmail.ts`)

### 2. Organizacja plików

```
app/
├── composables/
│   ├── useSeo.ts
│   └── useForm.ts
├── components/
│   ├── ui/
│   │   ├── Button.vue
│   │   └── Card.vue
│   └── sections/
│       └── Hero.vue
└── utils/
    └── content.ts
```

### 3. Unikanie konfliktów nazw

Jeśli masz komponenty o podobnych nazwach, możesz użyć prefiksów lub zagnieżdżonych katalogów:

```
components/
├── ui/
│   └── Button.vue      # <UiButton />
└── forms/
    └── Button.vue      # <FormsButton />
```

### 4. Optymalizacja

Auto-imports są optymalizowane przez tree-shaking - tylko używane elementy są dołączane do finalnego bundle'a.

## Korzyści auto-imports

1. **Mniej boilerplate** - Nie musisz pisać importów
2. **Lepszy DX** - Szybsze pisanie kodu
3. **Mniej błędów** - Mniej możliwości na literówki w ścieżkach importów
4. **Spójność** - Jednolite podejście w całym projekcie
5. **TypeScript** - Pełne wsparcie typów out-of-the-box

## Podsumowanie

Auto-imports w Nuxt 4 to potężna funkcja, która znacząco poprawia Developer Experience. Eliminując potrzebę ręcznych importów, Nuxt pozwala skupić się na pisaniu logiki aplikacji, a nie na zarządzaniu importami.

Dzięki automatycznemu wsparciu TypeScript i optymalizacji przez tree-shaking, auto-imports są nie tylko wygodne, ale także wydajne.

**Dokumentacja:**

- [Auto-imports w Nuxt 4](https://nuxt.com/docs/4.x/guide/concepts/auto-imports)
- [Directory Structure](https://nuxt.com/docs/4.x/directory-structure)
