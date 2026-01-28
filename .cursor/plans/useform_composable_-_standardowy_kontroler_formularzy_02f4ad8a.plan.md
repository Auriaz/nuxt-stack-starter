---
name: useForm composable - standardowy kontroler formularzy
overview: Zaplanowanie i zaprojektowanie composable `useForm()` jako standardowego kontrolera formularzy w aplikacji Nuxt 4, z integracją Nuxt UI UForm, walidacją Valibot i spójną obsługą błędów API.
todos:
  - id: create-useForm
    content: Utworzenie app/composables/useForm.ts z pełną implementacją API (values, errors, formError, pending, submitted, isValid, setValues, setField, reset, validate, handleSubmit, setErrorsFromApi)
    status: completed
  - id: fix-auth-login
    content: 'Poprawka AuthLoginForm.vue: :schema="LoginInputSchema", użycie form.handleSubmit(onSubmit), obsługa form.formError'
    status: completed
  - id: fix-auth-register
    content: 'Poprawka AuthRegisterForm.vue: użycie form.handleSubmit(onSubmit), obsługa form.formError'
    status: completed
  - id: fix-auth-forgot
    content: 'Poprawka AuthForgotPasswordForm.vue: :schema="ForgotPasswordInputSchema", użycie form.handleSubmit(onSubmit), obsługa form.formError'
    status: completed
  - id: fix-auth-reset
    content: 'Poprawka AuthResetPasswordForm.vue: użycie form.handleSubmit(onSubmit), prefill przez form.setValues w onMounted, obsługa form.formError'
    status: completed
  - id: update-api-client
    content: (Opcjonalne) Aktualizacja useApiClient do rzucania H3Error z data.error dla lepszej integracji z setErrorsFromApi
    status: completed
  - id: test-forms
    content: Testy manualne wszystkich 4 formularzy auth (login, register, forgot, reset) - sprawdzenie walidacji, błędów API, pending state
    status: completed
  - id: create-docs
    content: 'Utworzenie content/docs/useForm.md z dokumentacją: wprowadzenie, podstawowe użycie, integracja z UForm/UAuthForm, obsługa błędów, przykłady, API Reference'
    status: completed
isProject: false
---

# Plan wdrożenia `useForm` composable

## 1. Analiza obecnego stanu

### 1.1 Istniejące formularze auth

- **AuthLoginForm.vue**: używa `form.pending.value`, `:schema="schema"` (błąd - powinno być `LoginInputSchema`)
- **AuthRegisterForm.vue**: używa `form.pending.value`, `:schema="RegisterInputSchema"` (OK)
- **AuthForgotPasswordForm.vue**: używa `form.pending.value`, `:schema="schema"` (błąd - powinno być `ForgotPasswordInputSchema`)
- **AuthResetPasswordForm.vue**: używa `form.pending.value`, `form.values.value` (prefill z query), `:schema="ResetPasswordInputSchema"` (OK)

### 1.2 Wymagania z obecnego kodu

- `form.pending.value` - stan ładowania podczas submit (wszystkie 4 formularze)
- `form.values.value` - wartości formularza (tylko ResetPassword do prefill)
- Integracja z `UAuthForm` (Nuxt UI) - wymaga `:schema` prop
- Obsługa błędów przez `useAuth` (toasty, redirecty)

### 1.3 Format błędów API (obecny)

Backend zwraca błędy w formacie:

```typescript
{
  data: {
    error: {
      code: 'VALIDATION_ERROR' | 'UNAUTHORIZED' | ...,
      message: 'Human readable message',
      issues?: Array<{ path: string, message: string }> // dla 422
    }
  }
}
```

`useApiClient` rzuca `Error` z `message`, ale nie mapuje `issues` do błędów pól.

## 2. Projekt API `useForm`

### 2.1 Kontrakt publiczny

```typescript
// app/composables/useForm.ts

import type { BaseSchema, InferInput, InferOutput } from 'valibot'
import { safeParse } from 'valibot'

export interface UseFormOptions<T extends BaseSchema> {
  schema: T
  initialValues?: Partial<InferInput<T>>
  onSubmit?: (values: InferOutput<T>) => Promise<void> | void
}

export interface UseFormReturn<T extends BaseSchema> {
  // Stan
  values: Ref<Partial<InferInput<T>>>
  errors: Ref<Record<string, string>>
  formError: Ref<string | null>
  pending: Ref<boolean>
  submitted: Ref<boolean>
  isValid: ComputedRef<boolean>

  // Metody
  setValues: (values: Partial<InferInput<T>>) => void
  setField: (name: string, value: unknown) => void
  reset: () => void
  validate: () => boolean
  handleSubmit: (
    callback?: (values: InferOutput<T>) => Promise<void> | void
  ) => (event: FormSubmitEvent<InferOutput<T>>) => Promise<void>
  setErrorsFromApi: (error: unknown) => void
}

export function useForm<T extends BaseSchema>(
  schema: T,
  options?: Omit<UseFormOptions<T>, 'schema'>
): UseFormReturn<T>
```

### 2.2 Szczegóły implementacji

**Stan:**

- `values`: reactive object z wartościami formularza (Partial dla prefill)
- `errors`: Record<string, string> - błędy pól (klucz = nazwa pola, wartość = komunikat)
- `formError`: string | null - błąd ogólny (np. "Invalid credentials")
- `pending`: boolean - stan ładowania podczas submit
- `submitted`: boolean - czy formularz był już submitowany (dla UX)
- `isValid`: computed - czy formularz jest walidny (brak błędów)

**Metody:**

- `setValues(partial)`: ustawia wartości formularza (merge z obecnymi)
- `setField(name, value)`: ustawia pojedyncze pole
- `reset()`: resetuje formularz (values, errors, formError, pending, submitted)
- `validate()`: waliduje `values` przez Valibot, aktualizuje `errors`, zwraca boolean
- `handleSubmit(callback)`: zwraca handler dla `@submit` UForm:
  - waliduje formularz
  - ustawia `pending = true`
  - wywołuje callback z walidowanymi wartościami
  - mapuje błędy API do `errors` / `formError`
  - kończy `pending = false`
- `setErrorsFromApi(error)`: mapuje błąd API do `errors` / `formError`:
  - rozpoznaje format `{ data: { error: { code, message, issues? } } }`
  - dla 422 z `issues`: mapuje do `errors`
  - dla innych: ustawia `formError`

### 2.3 Mapowanie błędów Valibot → errors

```typescript
function mapValibotIssuesToErrors(issues: ValibotIssue[]): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of issues) {
    // issue.path to array: [{ key: 'email' }, { key: '0' }] dla nested
    const path = issue.path?.map((p) => String(p.key)).join('.') || 'root'
    errors[path] = issue.message
  }
  return errors
}
```

## 3. Integracja z Nuxt UI UForm

### 3.1 Wzorzec użycia

```vue
<script setup lang="ts">
  import { LoginInputSchema } from '#shared/schemas/auth'

  const form = useForm(LoginInputSchema, {
    initialValues: { remember: false },
  })

  async function onSubmit(values: InferOutput<typeof LoginInputSchema>) {
    await auth.login(values)
  }
</script>

<template>
  <UForm
    :schema="LoginInputSchema"
    :state="form.values"
    :validate="form.validate"
    @submit="form.handleSubmit(onSubmit)"
  >
    <UFormField label="Email" name="email" :error="form.errors.email">
      <UInput v-model="form.values.email" />
    </UFormField>

    <UButton type="submit" :loading="form.pending.value" :disabled="!form.isValid.value">
      Zaloguj się
    </UButton>

    <UAlert v-if="form.formError.value" color="error">
      {{ form.formError.value }}
    </UAlert>
  </UForm>
</template>
```

**Uwaga:** `UAuthForm` to specjalny komponent Nuxt UI dla auth, który przyjmuje `:schema` i `:fields`. Dla spójności, `useForm` powinien działać z oboma (`UForm` i `UAuthForm`).

### 3.2 Integracja z UAuthForm

`UAuthForm` używa `FormSubmitEvent` z `payload.data`. `handleSubmit` musi być kompatybilny:

```typescript
handleSubmit: (callback) => async (event: FormSubmitEvent<InferOutput<T>>) => {
  const data = event.data // UAuthForm przekazuje dane tutaj
  // ... walidacja, pending, callback, error handling
}
```

## 4. Format błędów API (kontrakt backend ↔ frontend)

### 4.1 Envelope odpowiedzi

**SUKCES:**

```json
{
  "data": <payload>,
  "meta": { "requestId": "req_123" } // opcjonalne
}
```

**BŁĄD:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "status": 422,
    "issues": [
      { "path": "email", "message": "Invalid email format" },
      { "path": "password", "message": "Password is required" }
    ],
    "requestId": "req_456"
  }
}
```

### 4.2 Kody błędów (minimalny zestaw)

- `400` `BAD_REQUEST` - nieprawidłowe żądanie
- `401` `UNAUTHORIZED` - brak/niepoprawna sesja
- `403` `FORBIDDEN` - brak uprawnień
- `404` `NOT_FOUND` - brak zasobu
- `422` `VALIDATION_ERROR` - błąd walidacji (z `issues`)
- `429` `RATE_LIMITED` - zbyt wiele prób
- `500` `INTERNAL_ERROR` - błąd serwera

### 4.3 Mapowanie w `setErrorsFromApi`

```typescript
function setErrorsFromApi(error: unknown): void {
  // Reset errors
  errors.value = {}
  formError.value = null

  // Rozpoznaj format H3Error / $fetch error
  const h3Error = error as { data?: { error?: ApiError }; statusCode?: number }

  if (h3Error.data?.error) {
    const apiError = h3Error.data.error

    // 422 z issues → mapuj do errors
    if (h3Error.statusCode === 422 && apiError.issues) {
      for (const issue of apiError.issues) {
        const path = issue.path || 'root'
        errors.value[path] = issue.message
      }
    } else {
      // Inne błędy → formError
      formError.value = apiError.message
    }
  } else if (error instanceof Error) {
    formError.value = error.message
  } else {
    formError.value = 'Wystąpił nieoczekiwany błąd'
  }
}
```

## 5. Minimalizm + rozszerzalność

### 5.1 MVP (obowiązkowe teraz)

- `values`, `errors`, `formError`, `pending`, `submitted`, `isValid`
- `setValues`, `setField`, `reset`, `validate`, `handleSubmit`, `setErrorsFromApi`
- Integracja z Valibot schemas
- Mapowanie błędów API

### 5.2 Extensions (opcjonalne później)

- `touched`, `dirty` - tracking zmian
- `autosave` / `localStorage` - zapisywanie draftów
- `multi-step` - formularze wieloetapowe
- `async validation` - walidacja asynchroniczna (np. sprawdzenie unikalności email)
- `focus first error` - automatyczne fokusowanie pierwszego błędu
- `toasts/redirect hooks` - automatyczne toasty/redirecty po sukcesie

**Uwaga:** API MVP ma być przygotowane na rozszerzenia bez breaking changes.

## 6. Plan migracji formularzy auth

### 6.1 Utworzenie `app/composables/useForm.ts`

- Implementacja zgodna z API z sekcji 2
- Testy jednostkowe (opcjonalne w MVP)

### 6.2 Poprawki w komponentach

**AuthLoginForm.vue:**

- `:schema="schema"` → `:schema="LoginInputSchema"`
- `onSubmit` → używa `form.handleSubmit(async (values) => await auth.login(values))`
- Usuń ręczne zarządzanie `pending` (użyj `form.pending.value`)

**AuthRegisterForm.vue:**

- `onSubmit` → używa `form.handleSubmit(async (values) => await auth.register(values))`
- Usuń ręczne zarządzanie `pending`

**AuthForgotPasswordForm.vue:**

- `:schema="schema"` → `:schema="ForgotPasswordInputSchema"`
- `onSubmit` → używa `form.handleSubmit(async (values) => await auth.forgotPassword(values))`
- Usuń ręczne zarządzanie `pending`

**AuthResetPasswordForm.vue:**

- `onSubmit` → używa `form.handleSubmit(async (values) => await auth.resetPassword({ ...values, token: token.value }))`
- Prefill przez `form.setValues({ email: email.value, token: token.value })` w `onMounted`
- Usuń ręczne zarządzanie `pending`

### 6.3 Przykład refaktoru (AuthLoginForm.vue)

**PRZED:**

```vue
<script setup lang="ts">
  const form = useForm(LoginInputSchema)
  async function onSubmit(payload: FormSubmitEvent<any>) {
    const data = payload.data
    await auth.login({
      email: data.email,
      password: data.password,
      remember: data.remember,
    })
  }
</script>
<template>
  <UAuthForm
    :schema="schema"
    :submit="{ loading: form.pending.value || auth.isLoading.value }"
    @submit="onSubmit"
  />
</template>
```

**PO:**

```vue
<script setup lang="ts">
  const form = useForm(LoginInputSchema)

  async function onSubmit(values: InferOutput<typeof LoginInputSchema>) {
    try {
      await auth.login(values)
    } catch (error) {
      form.setErrorsFromApi(error)
      throw error // Re-throw dla useAuth (obsługuje toast)
    }
  }
</script>
<template>
  <UAuthForm
    :schema="LoginInputSchema"
    :submit="{ loading: form.pending.value || auth.isLoading.value }"
    @submit="form.handleSubmit(onSubmit)"
  >
    <template v-if="form.formError.value" #error>
      <UAlert color="error">{{ form.formError.value }}</UAlert>
    </template>
  </UAuthForm>
</template>
```

## 7. Aktualizacja `useApiClient` (opcjonalne)

Obecnie `useApiClient` rzuca `Error` z `message`, ale nie przekazuje struktury `{ data: { error } }`.

**Opcja A (preferowana):** `useApiClient` rzuca obiekt z `data.error`, a `useForm.setErrorsFromApi` go parsuje.

**Opcja B:** `useApiClient` zwraca `{ data?, error? }`, a resources sprawdzają `error` przed zwróceniem.

**Rekomendacja:** Opcja A - `useApiClient` rzuca H3Error z `data.error`, `useForm` parsuje.

## 8. Dokumentacja

### 8.1 Utworzenie `content/docs/useForm.md`

Sekcje:

- Wprowadzenie
- Podstawowe użycie
- Integracja z UForm / UAuthForm
- Obsługa błędów API
- Przykłady (Login, Register, ResetPassword, Contact)
- API Reference
- Rozszerzenia (future)

### 8.2 Przykłady w dokumentacji

- Prosty formularz (Login)
- Formularz z prefill (ResetPassword)
- Formularz z custom validation
- Obsługa błędów walidacji i biznesowych

## 9. Checklist wdrożenia

- [ ] Utworzenie `app/composables/useForm.ts` z pełną implementacją
- [ ] Poprawka `AuthLoginForm.vue`: `:schema="LoginInputSchema"`, użycie `form.handleSubmit`
- [ ] Poprawka `AuthRegisterForm.vue`: użycie `form.handleSubmit`
- [ ] Poprawka `AuthForgotPasswordForm.vue`: `:schema="ForgotPasswordInputSchema"`, użycie `form.handleSubmit`
- [ ] Poprawka `AuthResetPasswordForm.vue`: użycie `form.handleSubmit`, prefill przez `form.setValues`
- [ ] (Opcjonalne) Aktualizacja `useApiClient` do rzucania H3Error z `data.error`
- [ ] Testy manualne wszystkich 4 formularzy auth
- [ ] Utworzenie `content/docs/useForm.md` z dokumentacją
- [ ] Aktualizacja README.md z linkiem do dokumentacji

## 10. Uwagi techniczne

- `useForm` używa `InferInput` i `InferOutput` z Valibot dla type safety
- `values` jest `Partial<InferInput<T>>` dla prefill (nie wszystkie pola muszą być od razu)
- `handleSubmit` zwraca funkcję kompatybilną z `@submit` UForm / UAuthForm
- `setErrorsFromApi` jest defensywny - obsługuje różne formaty błędów (H3Error, Error, unknown)
- `validate` używa `safeParse` z Valibot (nie rzuca, zwraca boolean)
