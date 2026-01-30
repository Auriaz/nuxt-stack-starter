---
title: ModalConfirmation
description: Reużywalny modal do potwierdzania akcji (usuwanie, zatwierdzanie) — użycie i API
---

# ModalConfirmation

`ModalConfirmation` to komponent modala służący do potwierdzania akcji użytkownika (np. usunięcie zdjęcia, zatwierdzenie operacji). Bazuje na `Modal.vue` i udostępnia prosty interfejs: otwarcie z opcjonalnym argumentem, przyciski Potwierdź / Anuluj oraz eventy `confirm` i `cancel`.

## Gdzie jest komponent

- Ścieżka: `app/components/Modal/Confirmation/ModalConfirmation.vue`
- Bazowy komponent: `app/components/Modal/Modal.vue`

## Props

| Prop           | Typ                                  | Domyślnie                            | Opis                                                                        |
| -------------- | ------------------------------------ | ------------------------------------ | --------------------------------------------------------------------------- |
| `title`        | `string`                             | `'Potwierdź'`                        | Tytuł modala (np. "Usuń zdjęcie")                                           |
| `description`  | `string`                             | `'Czy na pewno chcesz kontynuować?'` | Opis / pytanie                                                              |
| `confirmLabel` | `string`                             | `'Potwierdź'`                        | Etykieta przycisku potwierdzenia                                            |
| `cancelLabel`  | `string`                             | `'Anuluj'`                           | Etykieta przycisku anulowania                                               |
| `variant`      | `'neutral' \| 'primary' \| 'danger'` | `'neutral'`                          | Kolor przycisku potwierdzenia: `danger` dla akcji destrukcyjnych (usuwanie) |

## Eventy

- **`confirm`** — emisja z argumentem przekazanym do `open(arg)`. Po kliknięciu „Potwierdź” możesz użyć tego argumentu (np. id obiektu do usunięcia).
- **`cancel`** — emisja przy kliknięciu „Anuluj” lub zamknięciu modala (np. overlay / Escape).

## Metody (defineExpose)

- **`open(arg?: unknown)`** — otwiera modal; opcjonalny `arg` jest dostępny w evencie `confirm` (oraz wewnętrznie w `Modal`).
- **`close()`** — zamyka modal.

## Podstawowe użycie

```vue
<script setup lang="ts">
  const confirmModalRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)

  function askRemoveAvatar() {
    confirmModalRef.value?.open()
  }

  function onConfirmRemove() {
    // np. wywołanie API usunięcia avatara
    removeAvatar()
  }

  function onCancel() {
    // opcjonalnie: np. log
  }
</script>

<template>
  <UButton variant="outline" color="error" @click="askRemoveAvatar"> Usuń zdjęcie </UButton>

  <ModalConfirmation
    ref="confirmModalRef"
    title="Usuń zdjęcie"
    description="Czy na pewno chcesz usunąć zdjęcie profilowe?"
    confirm-label="Usuń"
    cancel-label="Anuluj"
    variant="danger"
    @confirm="onConfirmRemove"
    @cancel="onCancel"
  />
</template>
```

## Użycie z argumentem (np. id do usunięcia)

```vue
<script setup lang="ts">
  const confirmModalRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)

  function askDeleteItem(id: string) {
    confirmModalRef.value?.open(id)
  }

  function onConfirm(arg: unknown) {
    const id = arg as string
    if (id) {
      deleteItem(id)
    }
  }
</script>

<template>
  <ModalConfirmation
    ref="confirmModalRef"
    title="Usuń element"
    description="Czy na pewno chcesz usunąć ten element?"
    confirm-label="Usuń"
    variant="danger"
    @confirm="onConfirm"
  />
</template>
```

## Warianty przycisku potwierdzenia

- **`neutral`** — domyślny, dla neutralnych potwierdzeń.
- **`primary`** — dla głównej akcji (np. zatwierdzenie formularza w modalu).
- **`danger`** — dla akcji destrukcyjnych (usuwanie zdjęcia, rekordu itd.). Używaj tego zamiast natywnego `confirm()` w przeglądarce.

## Zasady (zgodnie z remember.md)

- Do potwierdzania akcji w UI używaj `ModalConfirmation`, nie `window.confirm()`.
- Dla usuwania / nieodwracalnych akcji ustaw `variant="danger"` i czytelne `title` / `description`.
