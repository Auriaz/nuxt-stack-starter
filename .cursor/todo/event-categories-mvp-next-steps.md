# Event Categories MVP - Dalsze kroki

**Status**: Backend MVP + Frontend komponenty bazowe ✅  
**Pozostało**: Migracja DB, Settings UI Panel, Integracja Calendar, Testy

---

## ✅ Co zostało zaimplementowane (MVP Backend + Frontend Core)

### 1. Model Prisma + relacje

- ✅ Model `EventCategory` (id, userId, teamId, label, slug, color, icon, isSystem, isDefault, sortOrder)
- ✅ Relacje: `User.eventCategories`, `Team.eventCategories`, `CalendarEvent.category`
- ✅ Unique constraint: `slug_userId_teamId`
- ✅ Indexy: userId, teamId, isSystem, categoryId

### 2. Schemas Valibot + DTO

- ✅ `shared/schemas/event-category.ts` (Create, Update, Scope, ListQuery)
- ✅ `shared/types/event-category.ts` (DTO, Input types, Scope)

### 3. Permissions

- ✅ `shared/permissions.ts`: CATEGORY_READ, CREATE, EDIT, DELETE, TEAM_MANAGE, SYSTEM_MANAGE
- ✅ Seed permissions (admin: wszystkie, user: read+create+edit+delete)

### 4. Repository

- ✅ `server/repositories/eventCategory.repo.ts` (findById, findBySlug, list, create, update, delete, countBySlug, findDefaultForScope)

### 5. Domain Layer

- ✅ `domain/event-category/rules/categoryRules.ts` (canDelete, canEdit, normalizeSlug, getCategoryScope)
- ✅ `domain/event-category/mappers/categoryMapper.ts` (Record → DTO)
- ✅ `domain/event-category/use-cases/` (listCategories, createCategory, updateCategory, deleteCategory)

### 6. API Endpoints

- ✅ `GET /api/event-categories` (lista według scope)
- ✅ `POST /api/event-categories` (tworzenie)
- ✅ `PATCH /api/event-categories/:id` (edycja)
- ✅ `DELETE /api/event-categories/:id` (usuwanie + fallback)

### 7. Frontend Resources

- ✅ `app/composables/resources/useEventCategoriesResource.ts` (listCategories, createCategory, updateCategory, deleteCategory)

### 8. UI Komponenty bazowe

- ✅ `app/components/EventCategory/Badge.vue` (reużywalny badge z ikoną + kolorem)
- ✅ `app/components/EventCategory/Picker.vue` (select z kategoriami)
- ✅ `app/components/EventCategory/Form.vue` (modal dodaj/edytuj z UColorPicker + presety)

### 9. Seed systemowych kategorii

- ✅ `prisma/seed.ts`: 6 kategorii systemowych (Spotkanie, Deadline, Prywatne [default], Zespołowe, Projekt, Przypomnienie)

---

## 🔧 Kroki do uruchomienia (WYMAGANE)

### 1. **Migracja Prisma** (KLUCZOWE!)

```bash
# Z katalogu projektu
bun run db:migrate
# Podaj nazwę: add_event_categories

# Jeśli błąd, użyj bezpośrednio:
bunx prisma migrate dev --name add_event_categories

# Wygeneruj klienta Prisma (po migracji):
bun run db:generate
```

### 2. **Seed kategorii systemowych**

```bash
bun run db:seed
```

Sprawdź w DB:

```sql
SELECT * FROM event_categories WHERE "isSystem" = true;
-- Powinno być 6 rekordów (meeting, deadline, personal, team, project, reminder)
```

---

## 📝 TODO: Pozostałe kroki MVP

### A) Settings UI Panel (`/dashboard/settings/event-categories`)

**Lokalizacja**: `app/pages/dashboard/settings/event-categories.vue`

**Struktura**:

```vue
<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel title="Kategorie zdarzeń">
      <template #header-actions>
        <UButton color="primary" @click="openCreateModal">
          <UIcon name="i-lucide-plus" />
          Dodaj kategorię
        </UButton>
      </template>

      <EventCategoryList
        :categories="categories"
        :loading="loading"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </DashboardPanel>

    <EventCategoryForm
      v-model:open="isFormOpen"
      :category="selectedCategory"
      @submit="handleSubmit"
    />
  </NuxtLayout>
</template>

<script setup>
  // Użyj useEventCategoriesResource()
  // Lista + CRUD + modal
</script>
```

**Komponenty do utworzenia**:

- `app/components/EventCategory/List.vue` (tabela z akcjami edit/delete)
- Dodaj link w `app/components/Dashboard/Navigation.vue` (Settings → Kategorie)

---

### B) Integracja z Calendar

#### B.1) **Dodaj categoryId do formularzy wydarzeń**

**Pliki do edycji**:

- `app/components/Calendar/Modals/CreateEventModal.vue`
- `app/components/Calendar/Modals/EditEventModal.vue`

**Dodaj pole**:

```vue
<UFormField
  label="Kategoria"
  name="categoryId"
  :error="form.errors.value?.categoryId"
  class="w-full"
>
  <EventCategoryPicker
    v-model="form.values.value.categoryId"
    :categories="categories"
    placeholder="Wybierz kategorię (opcjonalne)"
  />
</UFormField>
```

**W script setup**:

```ts
const categoriesResource = useEventCategoriesResource()
const categories = ref<EventCategoryDTO[]>([])

onMounted(async () => {
  categories.value = await categoriesResource.listCategories({ scope: 'all' })
})
```

#### B.2) **Wyświetl badge w EventCard**

**Plik**: `app/components/Calendar/Views/*.vue` (EventCard w widokach)

**Dodaj**:

```vue
<EventCategoryBadge v-if="event.category" :category="event.category" size="xs" />
```

**Backend**: Dodaj `include: { category: true }` w `server/repositories/calendar.repo.ts` (findEventById, listEvents...)

#### B.3) **Filtr po kategorii**

**Lokalizacja**: `app/components/Calendar/Filters/CalendarCategoryFilter.vue`

```vue
<template>
  <UCard>
    <div class="space-y-2">
      <p class="text-sm font-medium">Kategorie</p>
      <UCheckbox
        v-for="cat in categories"
        :key="cat.id"
        v-model="selectedCategories"
        :value="cat.id"
      >
        <EventCategoryBadge :category="cat" size="xs" />
      </UCheckbox>
    </div>
  </UCard>
</template>

<script setup>
  // emit('update:selected', selectedCategories)
</script>
```

Dodaj do `app/pages/dashboard/calendar/index.vue` w sidebaru.

---

## 🧪 Testy (po integracji)

### Unit tests (domain)

```bash
bun test domain/event-category
```

**Pliki do utworzenia**:

- `test/unit/domain/event-category/rules/categoryRules.test.ts`
- `test/unit/domain/event-category/use-cases/createCategory.test.ts`
- `test/unit/domain/event-category/use-cases/deleteCategory.test.ts`

### API tests

```bash
bun test server/api/event-categories
```

**Pliki do utworzenia**:

- `test/api/event-categories.test.ts` (GET, POST, PATCH, DELETE)

### E2E tests (Playwright)

- Tworzenie kategorii
- Przypisanie do eventu
- Filtrowanie po kategorii

---

## 🎯 Checklist finalizacji MVP

- [ ] Migracja Prisma wykonana (`bunx prisma migrate dev --name add_event_categories`)
- [ ] Seed kategorii systemowych (`bun run db:seed`)
- [ ] Settings UI Panel (`/dashboard/settings/event-categories`)
  - [ ] `EventCategory/List.vue`
  - [ ] Link w nawigacji dashboardu
- [ ] Integracja Calendar
  - [ ] Picker w CreateEventModal
  - [ ] Picker w EditEventModal
  - [ ] Badge w EventCard (widoki)
  - [ ] Include category w repository
  - [ ] Filtr po kategorii (sidebar)
- [ ] Testy unit (domain)
- [ ] Testy API
- [ ] Testy E2E (opcjonalnie)
- [ ] Aktualizacja dokumentacji (`content/docs/EventCategories.md`)
- [ ] Aktualizacja `.cursor/remember.md` (sekcja Event Categories)

---

## 🚀 V2 (future):

- [ ] Real-time: WS events (category.updated, category.deleted)
- [ ] Drag & drop reorder (sortOrder)
- [ ] Task Management + categoryId
- [ ] Notification.categoryId (opcjonalnie)
- [ ] Google Calendar mapper (hex → colorId)
- [ ] Slack webhook formatter (color)
- [ ] AI auto-assign category based on event title

---

## 📚 Dokumentacja

Po finalizacji MVP dodaj:

- `content/docs/EventCategories.md` (user guide: jak tworzyć kategorie, jak przypisywać)
- Zaktualizuj `.cursor/remember.md`:

```md
## Event Categories

- System kategorii dla Calendar, Tasks, Notifications
- Model: EventCategory (userId, teamId, label, slug, color, icon, isSystem, isDefault)
- Scope: system (global) / personal (userId) / team (teamId)
- MVP: CRUD API, Settings UI, integracja Calendar (picker + badge + filtr)
- V2: real-time sync, tasks, drag&drop reorder, integracje zewnętrzne
```

---

## Następne kroki (NOW):

1. **Uruchom migrację**: `bunx prisma migrate dev --name add_event_categories`
2. **Uruchom seed**: `bun run db:seed`
3. **Zaimplementuj Settings UI Panel**: `/dashboard/settings/event-categories`
4. **Zintegruj z Calendar**: picker w modalach + badge w widokach + filtr
5. **Testy** (min. API tests)

---

Gratulacje! Backend MVP + Frontend Core są gotowe. 🎉  
Pozostało: migration → Settings UI → Calendar integration → tests → done!
