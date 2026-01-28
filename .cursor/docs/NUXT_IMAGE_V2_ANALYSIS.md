# Analiza funkcji Nuxt Image v2 dla projektu Fullstack Base

## 📊 Status projektu

- **Aktualna wersja Nuxt Image**: `2.0.0` ✅ (najnowsza wersja)
- **Użycie**: 6 komponentów używają `<NuxtImg>`
- **Typ projektu**: Prerenderowane strony statyczne + SSR

## 🎯 Nowe funkcje v2 do wykorzystania

### 1. 🎨 Typed Composables (ŚREDNI PRIORYTET)

**Dlaczego**: Lepsze TypeScript support i autocomplete dla modyfikatorów obrazów.

**Korzyści**:

- Pełne type inference dla `useImage()` composable
- Autocomplete dla modyfikatorów (width, height, fit, etc.)
- Type-safe konfiguracja

**Gdzie zastosować**:

- `app/components/content/ProseImg.vue` - można użyć `useImage()` zamiast ręcznego przetwarzania URL
- Nowe komponenty wymagające dynamicznego generowania URL obrazów

**Przykład implementacji**:

```ts
// app/components/content/ProseImg.vue
<script setup lang="ts">
const props = defineProps({
  src: String,
  alt: String,
  width: [String, Number],
  height: [String, Number]
})

const img = useImage() // Typed composable z v2

const imageUrl = computed(() => {
  if (!props.src) return ''
  return img(props.src, {
    width: props.width,
    height: props.height,
    fit: 'cover', // TypeScript wie, że to valid value!
    format: 'webp'
  })
})
</script>

<template>
  <img :src="imageUrl" :alt="alt" class="block max-w-full h-auto rounded-lg" loading="lazy" />
</template>
```

**Status**: ⚠️ Opcjonalne - obecna implementacja działa dobrze

---

### 2. 🔗 Template Refs (NISKI PRIORYTET)

**Dlaczego**: Dostęp do natywnego elementu `<img>` może być przydatny dla zaawansowanych funkcji.

**Korzyści**:

- Bezpośredni dostęp do natywnego elementu img
- Możliwość dodania event listenerów
- Lepsza kontrola nad ładowaniem obrazów

**Gdzie zastosować**:

- Komponenty wymagające trackowania stanu ładowania
- Lazy loading z custom logic
- Animacje przy ładowaniu obrazów

**Przykład implementacji**:

```vue
<script setup>
  const imgRef = useTemplateRef('img')

  onMounted(() => {
    // Dostęp do natywnego elementu
    imgRef.value?.imgEl?.addEventListener('load', () => {
      console.log('Image loaded!')
    })
  })
</script>

<template>
  <NuxtImg ref="img" src="/image.jpg" />
</template>
```

**Status**: ⚠️ Opcjonalne - tylko jeśli potrzebujesz zaawansowanej kontroli

---

### 3. 🎭 Typed Slots (NISKI PRIORYTET)

**Dlaczego**: Lepsze type safety dla custom rendering obrazów.

**Korzyści**:

- Typed slot props (imgAttrs, isLoaded, src)
- Lepsze autocomplete w IDE
- Type-safe custom rendering

**Gdzie zastosować**:

- Komponenty z custom loading states
- Komponenty z placeholderami
- Komponenty z animacjami przy ładowaniu

**Przykład implementacji**:

```vue
<template>
  <NuxtImg src="/image.jpg" custom>
    <template #default="{ imgAttrs, isLoaded, src }">
      <div class="relative">
        <img v-bind="imgAttrs" :src="src" />
        <div v-if="!isLoaded" class="absolute inset-0 bg-muted animate-pulse">Loading...</div>
      </div>
    </template>
  </NuxtImg>
</template>
```

**Status**: ⚠️ Opcjonalne - tylko dla custom rendering

---

### 4. 🚀 Server-side Utilities (ŚREDNI PRIORYTET)

**Dlaczego**: Możliwość generowania URL obrazów w Nitro endpoints.

**Korzyści**:

- Generowanie URL obrazów w API endpoints
- Spójność między client i server
- Możliwość użycia w OG images, meta tags, etc.

**Gdzie zastosować**:

- API endpoints generujące OG images
- Meta tags z obrazami
- Email templates (jeśli dodane w przyszłości)

**Przykład implementacji**:

```ts
// server/api/og-image.ts
export default defineEventHandler((event) => {
  const img = useImage()

  return {
    url: img('/hero.jpg', {
      width: 1200,
      height: 630,
      fit: 'cover',
      format: 'webp',
    }),
  }
})
```

**Status**: ⚠️ Opcjonalne - tylko jeśli potrzebujesz generować obrazy w API

---

### 5. ⚡ Performance Improvements (AUTOMATYCZNE)

**Dlaczego**: Automatyczne ulepszenia w v2.

**Korzyści**:

- **IPX v3** - lepsza wydajność i obsługa sharp binaries
- **Better URL encoding** - używa URLSearchParams
- **Reduced runtime utilities** - mniejszy bundle
- **Streamlined screen sizes** - zgodne z Tailwind CSS

**Status**: ✅ Już działa (automatycznie w v2.0.0)

---

## 📋 Rekomendacje

### Quick Wins (Opcjonalnie)

1. **Refaktoryzacja `ProseImg.vue`** - użycie `useImage()` composable zamiast ręcznego przetwarzania URL
   - Lepsze type safety
   - Spójność z resztą projektu
   - Autocomplete dla modyfikatorów

2. **Dodanie typed slots** - jeśli potrzebujesz custom loading states w przyszłości

### Nie wymagane na razie

- **Template refs** - tylko jeśli potrzebujesz zaawansowanej kontroli
- **Server-side utilities** - tylko jeśli dodasz API endpoints generujące obrazy

---

## 🔍 Obecne użycie w projekcie

### Komponenty używające NuxtImg:

1. `app/components/portfolio/PortfolioCard.vue` - obrazy projektów
2. `app/pages/blog/[slug].vue` - obrazy w powiązanych postach
3. `app/components/Sections/Hero/SectionsHero.vue` - hero images
4. `app/pages/portfolio/[slug].vue` - obrazy projektów
5. `app/components/portfolio/PortfolioHero.vue` - hero images
6. `app/components/content/ProseImg.vue` - obrazy w content

### Obecna implementacja:

Wszystkie komponenty używają podstawowych funkcji `<NuxtImg>`:

- `src`, `alt`, `width`, `height`
- `loading="lazy"`
- `format="webp"` (w ProseImg)

**Status**: ✅ Działa dobrze, nie wymaga zmian

---

## 🎯 Podsumowanie

### Co już mamy:

- ✅ Nuxt Image v2.0.0 (najnowsza wersja)
- ✅ IPX v3 (automatycznie)
- ✅ Performance improvements (automatycznie)
- ✅ Podstawowe użycie w 6 komponentach

### Co można dodać (opcjonalnie):

- ⚠️ Typed composables (`useImage()`) w `ProseImg.vue`
- ⚠️ Typed slots dla custom loading states
- ⚠️ Server-side utilities dla API endpoints

### Co NIE jest potrzebne:

- ❌ Template refs (chyba że potrzebujesz zaawansowanej kontroli)
- ❌ Breaking changes (już na v2, wszystko działa)

---

## 🔗 Linki

- [Nuxt Image v2 Release Notes](https://nuxt.com/blog/nuxt-image-v2)
- [Nuxt Image Documentation](https://image.nuxt.com)
- [Migration Guide](https://image.nuxt.com/get-started/migration)
