# Analiza funkcji Nuxt 4.2 dla projektu Fullstack Base

## 📊 Status projektu

- **Aktualna wersja Nuxt**: `4.3.0` ✅ (nowsza niż 4.2, wszystkie funkcje dostępne)
- **Typ projektu**: Prerenderowane strony statyczne + SSR dla formularzy
- **Użycie `useAsyncData`**: Wiele miejsc (portfolio, blog, strony)

## 🎯 Rekomendowane funkcje do wdrożenia

### 1. ⚡ Async Data Handler Extraction (WYSOKI PRIORYTET)

**Dlaczego**: Projekt ma wiele prerenderowanych stron (`routeRules` z `prerender: true`), co idealnie pasuje do tej funkcji.

**Korzyści**:

- **Redukcja bundle size o ~39%** dla prerenderowanych stron
- Logika data fetching wyodrębniona do osobnych chunków
- Tylko potrzebny kod w bundle klienta

**Gdzie zastosować**:

- `app/pages/index.vue` - `useAsyncData('home', ...)`
- `app/pages/blog/[slug].vue` - 3x `useAsyncData` (post, surround, links)
- `app/pages/portfolio/index.vue` - `useAsyncData('portfolio-page', ...)`
- `app/pages/o-nas.vue` - `useAsyncData('about-page', ...)`
- `app/composables/usePortfolioContent.ts` - `useAsyncData` z kompleksową logiką

**Implementacja**:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    extractAsyncDataHandlers: true, // Dodaj to
  },
})
```

**Status**: ✅ Gotowe do wdrożenia (tylko konfiguracja)

---

### 2. 🎯 Abort Control for Data Fetching (ŚREDNI PRIORYTET)

**Dlaczego**: Projekt używa `useAsyncData` w wielu miejscach, szczególnie w `usePortfolioContent` gdzie może być wiele równoczesnych requestów.

**Korzyści**:

- Anulowanie requestów przy unmount komponentu
- Lepsze zarządzanie pamięcią
- Możliwość anulowania przy zmianie filtrów

**Gdzie zastosować**:

- `app/composables/usePortfolioContent.ts` - przy zmianie filtrów
- `app/pages/blog/[slug].vue` - przy nawigacji między postami
- `app/pages/dashboard/users/index.vue` - `useFetch('/api/users')`

**Przykład implementacji**:

```ts
// app/composables/usePortfolioContent.ts
export function usePortfolioContent(options?: PortfolioContentOptions) {
  const { data, pending, error, refresh } = useAsyncData(
    `portfolio-content-${JSON.stringify(options)}`,
    async (_nuxtApp, { signal }) => {
      // Dodaj signal
      const projects = await getPortfolioProjects({
        // ... options
      })
      // Użyj signal w $fetch jeśli potrzebne
      return mapped
    },
    {
      dedupe: 'cancel', // Anuluj poprzednie requesty
    }
  )
}
```

**Status**: ✅ Wdrożone (`usePortfolioContent`, `blog/[slug].vue`, `dashboard/users/index.vue`)

---

### 3. 🔧 Experimental TypeScript Plugin Support (ŚREDNI PRIORYTET)

**Dlaczego**: Projekt używa TypeScript i ma wiele auto-importowanych komponentów/schematów.

**Korzyści**:

- Smart component renaming (auto-importowane komponenty)
- Go to definition dla dynamicznych importów
- Nitro route navigation (z `$fetch` do `server/api/`)
- Lepsze auto-import support

**Implementacja**:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  experimental: {
    typescriptPlugin: true, // Dodaj to
  },
})
```

**Uwaga**: Wymaga wyboru workspace TypeScript version w VS Code.

**Status**: ✅ Gotowe do wdrożenia (tylko konfiguracja)

---

### 4. 🎨 Better Error Pages in Development (AUTOMATYCZNE)

**Dlaczego**: Automatyczna funkcja, nie wymaga konfiguracji.

**Korzyści**:

- Widzisz custom error page + technical overlay
- Lepsze debugowanie w development
- Nie wymaga żadnych zmian w kodzie

**Status**: ✅ Już działa (automatycznie w Nuxt 4.2+)

---

### 5. ⚡ Performance Improvements (AUTOMATYCZNE)

**Dlaczego**: Automatyczne ulepszenia w Nuxt 4.2+.

**Korzyści**:

- Precomputed renderer dependencies (szybszy cold start)
- Reduced dependencies (mniejsze bundle)
- Wszystko automatyczne

**Status**: ✅ Już działa (automatycznie w Nuxt 4.2+)

---

## ❌ Funkcje NIE zalecane (na razie)

### 1. Vite Environment API

**Dlaczego**:

- Eksperymentalne i może mieć breaking changes
- Projekt działa dobrze bez tego
- Lepiej poczekać na stabilną wersję

**Status**: ⏸️ Odłożyć na później

---

## 📋 Plan wdrożenia

### Faza 1: Quick Wins (5 minut)

1. ✅ Włącz `extractAsyncDataHandlers` w `nuxt.config.ts`
2. ✅ Włącz `typescriptPlugin` w `nuxt.config.ts`
3. ✅ Zrestartuj serwer i sprawdź bundle size

### Faza 2: Optymalizacja (opcjonalnie, 30-60 minut)

1. ✅ Dodaj AbortController do `usePortfolioContent` - **ZROBIONE**
2. ✅ Dodaj `dedupe: 'cancel'` do innych `useAsyncData` - **ZROBIONE** (`blog/[slug].vue`, `dashboard/users/index.vue`)
3. ⚠️ Przetestuj anulowanie requestów

---

## 📊 Oczekiwane rezultaty

### Po Fazie 1:

- **Bundle size**: Redukcja o ~30-40% dla prerenderowanych stron
- **DX**: Lepsze TypeScript navigation i auto-import
- **Performance**: Szybszy cold start (automatycznie)

### Po Fazie 2:

- **Memory**: Lepsze zarządzanie pamięcią (anulowanie requestów)
- **UX**: Szybsze przełączanie między filtrami/treścią

---

## 🔗 Linki

- [Nuxt 4.2 Release Notes](https://nuxt.com/blog/v4-2)
- [Async Data Handler Extraction Docs](https://nuxt.com/docs/getting-started/data-fetching#async-data-handler-extraction)
- [Abort Control Docs](https://nuxt.com/docs/getting-started/data-fetching#abort-control)
- [TypeScript Plugin Docs](https://nuxt.com/docs/guide/going-further/experimental-features#typescriptplugin)
