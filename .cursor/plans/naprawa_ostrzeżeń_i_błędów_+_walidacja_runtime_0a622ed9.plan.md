---
name: Naprawa ostrzeżeń i błędów + walidacja runtime
overview: 'Naprawa wszystkich ostrzeżeń i błędów w aplikacji: usunięcie duplikatów komponentów, dodanie walidacji runtime dla sections, poprawa błędów w kodzie oraz zmiana union na variant w schemacie.'
todos: []
---

# Naprawa ostrzeżeń i błędów + walidacja runtime

## Zidentyfikowane problemy

1. **Duplikaty komponentów** - stare `FAQ.vue` i `Features.vue` kolidują z nowymi `SectionsFAQ.vue` i `SectionsFeatures.vue`
2. **Brak walidacji runtime** - `SectionsRenderer.vue` nie waliduje sekcji przed renderowaniem
3. **Błąd w `index.vue`** - używa `page.value.meta` zamiast `page.value` oraz zawiera debug `<dump>`
4. **Schemat używa `union` zamiast `variant`** - w `sections.ts` linia 392
5. **Brak importu `any`** - w `content.ts` import jest, ale trzeba sprawdzić czy działa

## Plan naprawy

### 1. Usunięcie duplikatów komponentów

**Pliki do usunięcia:**

- `app/components/sections/FAQ/FAQ.vue` - stary komponent, zastąpiony przez `SectionsFAQ.vue`
- `app/components/sections/Features/Features.vue` - stary komponent, zastąpiony przez `SectionsFeatures.vue`

**Uzasadnienie:** Te komponenty nie są używane nigdzie w kodzie (sprawdzono grep), a powodują konflikty nazw w Nuxt auto-import.

### 2. Dodanie walidacji runtime w SectionsRenderer.vue

**Plik:** `app/components/sections/SectionsRenderer.vue`

**Zmiany:**

- Dodać import `safeParse` z `valibot` i `SectionSchema` z `#shared/schemas/sections`
- Utworzyć computed `validatedSections` który:
  - Filtruje sekcje po `enabled !== false`
  - Waliduje każdą sekcję używając `safeParse(SectionSchema, section)`
  - Loguje ostrzeżenia dla nieprawidłowych sekcji
  - Zwraca tylko zwalidowane sekcje
- Zastąpić `enabledSections` przez `validatedSections` w template

**Kod:**

```typescript
import { safeParse } from 'valibot'
import { SectionSchema } from '#shared/schemas/sections'

const validatedSections = computed(() => {
  if (!props.sections) return []

  return props.sections
    .filter((section) => section.enabled !== false)
    .map((section) => {
      const result = safeParse(SectionSchema, section)
      if (!result.success) {
        console.warn('Invalid section:', result.issues, section)
        return null
      }
      return result.output
    })
    .filter(Boolean) as Section[]
})
```

### 3. Naprawa błędów w index.vue

**Plik:** `app/pages/index.vue`

**Zmiany:**

- Linia 19: zmienić `getPageSections(page.value.meta)` na `getPageSections(page.value)` - `page.value` już jest obiektem `Page`, nie ma pola `meta`
- Linia 33: usunąć `<dump :value="page" />` - to debug component

### 4. Zmiana union na variant w sections.ts

**Plik:** `shared/schemas/sections.ts`

**Zmiany:**

- Linia 1: sprawdzić czy import zawiera `variant` (powinien być)
- Linia 392: zmienić `union([...])` na `variant('type', [...])`

**Uzasadnienie:** `variant` jest lepszy dla discriminated unions, ale ponieważ używamy `any()` w `PageSchema`, to nie powinno powodować problemów z JSON Schema conversion. Walidacja runtime w komponencie zapewni bezpieczeństwo typów.

### 5. Weryfikacja content.ts

**Plik:** `shared/schemas/content.ts`

**Sprawdzenie:**

- Upewnić się, że import zawiera `any` z `valibot` (linia 1)
- Upewnić się, że `sections: optional(array(any()))` jest ustawione (linia 77)
- Upewnić się, że `SectionSchema` nie jest importowany (linia 4)

### 6. Opcjonalnie: naprawa oferta.vue

**Plik:** `app/pages/oferta.vue`

**Problem:** Używa `<SectionsFAQ />` bez props, co może powodować błędy runtime.

**Rozwiązanie:** Albo dodać props, albo użyć `SectionsRenderer` z sekcjami z content layer (jeśli strona ma być data-driven).

**Decyzja:** Zostawić na razie, bo to może być zamierzone użycie komponentu z default props.

## Kolejność wykonania

1. Usunięcie duplikatów komponentów (FAQ.vue, Features.vue)
2. Naprawa union → variant w sections.ts
3. Dodanie walidacji runtime w SectionsRenderer.vue
4. Naprawa błędów w index.vue
5. Weryfikacja content.ts

## Oczekiwane rezultaty

- Brak ostrzeżeń o duplikatach komponentów
- Walidacja sekcji przed renderowaniem z logowaniem błędów
- Poprawne działanie strony głównej
- Brak błędów TypeScript/runtime
