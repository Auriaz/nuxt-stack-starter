---
name: Dashboard Blog List Studio
overview: Rozszerzenie strony dashboard/blog/index.vue o listę postów z kolekcji blog (Nuxt Content), przycisk „Edytuj w Studio” dla użytkowników z content.manage oraz krótką instrukcję korzystania z Studio.
todos: []
isProject: false
---

# Plan: Lista postów + „Edytuj w Studio” na dashboard/blog

## Kontekst

- Obecny [app/pages/dashboard/blog/index.vue](app/pages/dashboard/blog/index.vue) to placeholder (UAlert „Strona w przygotowaniu”).
- Lista postów publicznych jest już pobierana w [app/pages/blog/index.vue](app/pages/blog/index.vue) przez `queryCollection<BlogPostEntry>('blog').all()`.
- W Studio dokumenty kolekcji `blog` (source: `blog/*.md`) wybierane są w drzewie: **Content → blog → [nazwa pliku]** (np. `welcome`, `auto-imports-nuxt-4`). Nazwa pliku = ostatni segment `_path` (np. `/blog/welcome` → `welcome`).
- Przycisk „Edytuj w Studio” ma przenosić użytkownika na stronę, gdzie działa Studio (np. `/`), i pokazać krótką instrukcję, gdzie w Studio znaleźć dany wpis.

## Zakres zmian

### 1. Pobranie danych w [app/pages/dashboard/blog/index.vue](app/pages/dashboard/blog/index.vue)

- Dodać `useAsyncData('dashboard-blog-posts', () => queryCollection<BlogPostEntry>('blog').all())` — ten sam wzorzec co w [app/pages/blog/index.vue](app/pages/blog/index.vue).
- Typ: `BlogPostEntry` z `#shared/types/content` (zawiera m.in. `title`, `description`, `date`, `_path`, `_id`).

### 2. Instrukcja na górze panelu

- Krótki blok informacyjny (np. `UAlert` variant soft, color primary) tylko dla użytkowników z `content.manage`:
  - Tekst w stylu: „Aby edytować wpis, kliknij «Edytuj w Studio» i na otwartej stronie użyj skrótu **Ctrl+.** (lub przycisku Studio). W panelu Studio wybierz **Content → blog** i wybrany plik.”
- Warunek widoczności: `can(PERMISSIONS.CONTENT_MANAGE)` przez [app/composables/useAccess.ts](app/composables/useAccess.ts).

### 3. Lista postów

- Tabela lub lista kart (prosta, bez filtrów jak w BlogPostsGrid):
  - **Tytuł** (np. `post.title`), ewentualnie link do publicznego wpisu (`post._path` → `NuxtLink :to="post._path"`).
  - **Data** — sformatowana przez `formatDateShort(post.date, 'pl-PL')` z [shared/utils/content.ts](shared/utils/content.ts).
  - **Akcje**:
    - Link „Zobacz” do publicznego wpisu (`post._path`).
    - Przycisk „Edytuj w Studio” **tylko gdy** `can(PERMISSIONS.CONTENT_MANAGE)`:
      - Akcja: `navigateTo('/')` (strona, na której plugin Studio montuje panel).
      - Opcjonalnie: po nawigacji pokazać toast z tekstem typu: „W Studio wybierz: Content → blog → [nazwa pliku]”. Nazwa pliku: `post._path.split('/').filter(Boolean).pop()` (np. `welcome`).
- Stan pusty: gdy `posts.length === 0` — `UAlert` lub komunikat „Brak postów w blogu” + ewentualna informacja, że nowe wpisy dodaje się w Studio (Content → blog) lub w plikach `content/blog/*.md`.

### 4. Struktura szablonu (zachowanie layoutu)

- Zachować [DashboardPanel](app/components/Dashboard/Panel/DashboardPanel.vue) z `#body`:
  - Najpierw instrukcja (UAlert, warunek `hasContentManage`).
  - Poniżej lista (UTable lub UCard dla każdego wpisu).
- Bez nowych zależności; użycie istniejących komponentów Nuxt UI (UAlert, UButton, UTable lub UCard, NuxtLink).

### 5. Kwestie techniczne

- **Fetch tylko w stronie**: dane z `queryCollection` wywołane w `useAsyncData` w `dashboard/blog/index.vue`; brak fetch w komponentach (zgodnie z regułami projektu).
- **Uprawnienia**: `useAccess()` + `PERMISSIONS.CONTENT_MANAGE` z `#shared/permissions`; przycisk „Edytuj w Studio” i instrukcja widoczne tylko przy `can(PERMISSIONS.CONTENT_MANAGE)`.
- **Nawigacja do Studio**: `navigateTo('/')` — użytkownik ląduje na stronie głównej z aktywnym Studio (floating button); tam otwiera Studio (Ctrl+. lub klik) i ręcznie wybiera **Content → blog → [plik]** (nazwa pliku z `_path` w toaście lub w tooltipie przycisku).

## Proponowana struktura pliku (szkic)

```vue
<!-- app/pages/dashboard/blog/index.vue -->
<script lang="ts" setup>
  definePageMeta({ layout: 'dashboard', middleware: 'auth' })

  const { data: posts } = await useAsyncData('dashboard-blog-posts', () =>
    queryCollection<BlogPostEntry>('blog').all()
  )
  const { can } = useAccess()
  const hasContentManage = computed(() => can(PERMISSIONS.CONTENT_MANAGE))

  function getStudioFileName(post: BlogPostEntry): string {
    return post._path?.split('/').filter(Boolean).pop() ?? post._id ?? ''
  }

  function openInStudio(post: BlogPostEntry) {
    const fileName = getStudioFileName(post)
    navigateTo('/')
    // Opcjonalnie: toast z instrukcją "W Studio: Content → blog → {fileName}"
  }
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel title="Blog" icon="i-lucide-book-open">
      <template #body>
        <UAlert v-if="hasContentManage" ...>Instrukcja: Ctrl+., Content → blog → plik</UAlert>
        <!-- Stan pusty -->
        <UAlert v-if="!posts?.length">Brak postów...</UAlert>
        <!-- Tabela lub lista kart: tytuł, data, Zobacz, Edytuj w Studio (v-if hasContentManage) -->
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
```

## Podsumowanie

| Element                    | Źródło / implementacja                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Dane listy                 | `useAsyncData` + `queryCollection<BlogPostEntry>('blog').all()` w stronie                             |
| Instrukcja                 | UAlert, widoczny gdy `can(CONTENT_MANAGE)`                                                            |
| Nazwa pliku w Studio       | `_path.split('/').filter(Boolean).pop()`                                                              |
| Przycisk „Edytuj w Studio” | `navigateTo('/')` + opcjonalny toast z „Content → blog → [nazwa]”; widoczny gdy `can(CONTENT_MANAGE)` |
| Format daty                | `formatDateShort(post.date, 'pl-PL')` z shared/utils/content.ts                                       |

Nie wprowadza się osobnego komponentu listy na ten etap (wszystko w jednej stronie); w razie rozbudowy można później wyciągnąć tabelę/listę do np. `DashboardBlogList.vue`.
