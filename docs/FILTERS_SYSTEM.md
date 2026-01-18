# Globalny system filtrów

## Wprowadzenie

Globalny system filtrów umożliwia wyświetlanie panelu filtrów w overlay/drawer, który jest dostępny z poziomu Header na stronach, które deklarują posiadanie filtrów.

## Architektura

### 1. Composable: `useFilters()`

**Plik:** `app/composables/useFilters.ts`

Composable zarządza globalnym stanem filtrów:

- `isOpen` - czy panel jest otwarty (readonly)
- `hasFilters` - czy aktualna strona ma filtry (readonly)
- `open()` - otwiera panel
- `close()` - zamyka panel
- `toggle()` - przełącza stan
- `register()` - rejestruje stronę/sekcję jako mającą filtry
- `unregister()` - wyrejestrowuje stronę/sekcję

**Funkcjonalności:**

- Automatyczne zamykanie przy zmianie route
- Blokada scroll body gdy drawer jest otwarty
- Obsługa ESC do zamykania
- Licznik rejestracji (wiele komponentów może rejestrować filtry)

### 2. Komponent: `FiltersDrawer.vue`

**Plik:** `app/components/filters/FiltersDrawer.vue`

Komponent renderowany przez Teleport do `body`:

- Używa `UDrawer` z Nuxt UI
- Side: right (z prawej strony)
- Responsywny (full width na mobile, 384px na desktop)
- Slot na zawartość filtrów
- Przyciski: Reset, Zastosuj, Zamknij
- Emituje eventy: `reset`, `apply`

**SSR Safety:**

- Render tylko po `mounted` (ClientOnly + Teleport)

### 3. Integracja z Header

**Plik:** `app/components/Header/Header.vue`

Header automatycznie wyświetla przycisk "Filtry" gdy `filters.hasFilters.value === true`:

- Desktop: przycisk w sekcji `#right`
- Mobile: przycisk widoczny również
- Ikona: `i-lucide-filter`
- Kliknięcie: `filters.toggle()`

## Użycie

### Przykład 1: Komponent z filtrami (PortfolioGrid)

```vue
<script setup lang="ts">
  const filters = useFilters()

  onMounted(() => {
    // Rejestruj filtry gdy komponent jest zamontowany
    filters.register()
  })

  onUnmounted(() => {
    // Wyrejestruj gdy komponent jest odmontowany
    filters.unregister()
  })
</script>

<template>
  <div>
    <!-- Filtry lokalne (opcjonalnie) -->
    <div class="filters-local">
      <!-- ... -->
    </div>

    <!-- Globalny drawer filtrów -->
    <FiltersDrawer @reset="handleReset" @apply="handleApply">
      <!-- Zawartość filtrów -->
      <div class="space-y-4">
        <UFormField label="Tagi">
          <USelectMenu v-model="selectedTags" :items="availableTags" multiple />
        </UFormField>
        <!-- ... więcej filtrów ... -->
      </div>
    </FiltersDrawer>
  </div>
</template>
```

### Przykład 2: Strona z filtrami

```vue
<script setup lang="ts">
  const filters = useFilters()

  onMounted(() => {
    filters.register()
  })

  onUnmounted(() => {
    filters.unregister()
  })

  const handleReset = () => {
    // Reset logiki filtrów
    selectedTags.value = []
    selectedYear.value = null
  }

  const handleApply = () => {
    // Zastosuj filtry (drawer zamknie się automatycznie)
    applyFilters()
  }
</script>

<template>
  <div>
    <!-- Zawartość strony -->

    <!-- Globalny drawer filtrów -->
    <FiltersDrawer @reset="handleReset" @apply="handleApply">
      <!-- Filtry -->
      <UFormField label="Kategoria">
        <USelectMenu v-model="category" />
      </UFormField>
    </FiltersDrawer>
  </div>
</template>
```

### Przykład 3: Sekcja z filtrami (Page Builder)

```vue
<script setup lang="ts">
  // W komponencie sekcji (np. SectionsPortfolio)
  const filters = useFilters()

  onMounted(() => {
    if (props.props?.showFilters) {
      filters.register()
    }
  })

  onUnmounted(() => {
    if (props.props?.showFilters) {
      filters.unregister()
    }
  })
</script>
```

## Mechanizm rejestracji

System używa **licznika rejestracji**:

- Każdy komponent, który ma filtry, wywołuje `register()` w `onMounted`
- `hasFilters` jest `true` gdy `registeredCount > 0`
- Gdy ostatni komponent wywołuje `unregister()`, `hasFilters` staje się `false`
- Drawer automatycznie zamyka się gdy `hasFilters` staje się `false`

**Zalety:**

- Wiele komponentów może rejestrować filtry (np. sekcja portfolio + sekcja blog)
- Automatyczne czyszczenie przy unmount
- Działa z dynamicznymi sekcjami (page builder)

## Eventy FiltersDrawer

### `@reset`

Wywoływany gdy użytkownik kliknie "Resetuj". Zresetuj stan filtrów.

### `@apply`

Wywoływany gdy użytkownik kliknie "Zastosuj". Drawer zamknie się automatycznie po emisji.

## UX Features

- **ESC to close** - naciśnij ESC aby zamknąć drawer
- **Overlay click** - kliknięcie w tło zamyka drawer
- **Route change** - drawer zamyka się automatycznie przy zmianie route
- **Scroll lock** - body scroll jest zablokowany gdy drawer jest otwarty
- **Responsive** - drawer jest full width na mobile, 384px na desktop

## Typy TypeScript

```typescript
// useFilters() zwraca:
interface UseFiltersReturn {
  isOpen: Readonly<Ref<boolean>>
  hasFilters: Readonly<Ref<boolean>>
  open: () => void
  close: () => void
  toggle: () => void
  register: () => void
  unregister: () => void
}
```

## Best Practices

1. **Zawsze wyrejestruj** - wywołaj `unregister()` w `onUnmounted`
2. **Warunkowa rejestracja** - rejestruj tylko gdy filtry są rzeczywiście dostępne
3. **Reset w handlerze** - zaimplementuj logikę resetu w `@reset`
4. **Zastosuj w handlerze** - zaimplementuj logikę aplikacji filtrów w `@apply`
5. **SSR Safety** - używaj `ClientOnly` jeśli potrzebujesz dostępu do DOM

## Rozwiązywanie problemów

### Przycisk nie pojawia się w Header

- Sprawdź czy wywołałeś `filters.register()` w `onMounted`
- Sprawdź czy nie zapomniałeś wywołać `register()` (warunkowo)

### Drawer nie zamyka się

- Sprawdź czy `filters.close()` jest wywoływane
- Sprawdź czy nie ma błędów w konsoli

### Filtry nie działają

- Sprawdź czy zawartość filtrów jest w `<FiltersDrawer>` slot
- Sprawdź czy eventy `@reset` i `@apply` są obsługiwane
