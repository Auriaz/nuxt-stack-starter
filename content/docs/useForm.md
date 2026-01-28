---
title: useForm Composable
description: Standardowy kontroler formularzy w aplikacji Nuxt 4 z integracją Valibot i Nuxt UI
---

# useForm Composable

`useForm` to composable do zarządzania stanem formularzy w aplikacji Nuxt 4. Zapewnia spójny, minimalistyczny i skalowalny sposób obsługi formularzy oparty o Nuxt UI `UForm` oraz walidację Valibot.

## Wprowadzenie

`useForm` został zaprojektowany jako standardowy kontroler formularzy dla całej aplikacji. Zapewnia:

- **Zarządzanie stanem**: wartości formularza, błędy walidacji, stan pending
- **Walidację runtime**: integracja z Valibot schemas
- **Obsługę błędów API**: automatyczne mapowanie błędów z backendu do błędów pól
- **Integrację z Nuxt UI**: kompatybilność z `UForm` i `UAuthForm`
- **Type safety**: pełne wsparcie TypeScript z inferencją typów z Valibot

## Podstawowe użycie

```vue
<script setup lang="ts">
  import { LoginInputSchema } from '#shared/schemas/auth'
  import type { InferOutput } from 'valibot'

  const form = useForm(LoginInputSchema, {
    initialValues: { remember: false },
  })

  async function onSubmit(values: InferOutput<typeof LoginInputSchema>) {
    await auth.login(values)
  }
</script>

<template>
  <UForm :schema="LoginInputSchema" :state="form.values" @submit="form.handleSubmit(onSubmit)">
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

## Integracja z UForm / UAuthForm

### UForm (standardowy formularz)

```vue
<template>
  <UForm
    :schema="ContactFormInputSchema"
    :state="form.values"
    @submit="form.handleSubmit(onSubmit)"
  >
    <!-- Pola formularza -->
  </UForm>
</template>
```

### UAuthForm (formularz autoryzacji)

`UAuthForm` to specjalny komponent Nuxt UI dla formularzy auth. `useForm` jest w pełni kompatybilny:

```vue
<template>
  <UAuthForm :schema="LoginInputSchema" :fields="fields" @submit="form.handleSubmit(onSubmit)">
    <template v-if="form.formError.value" #error>
      <UAlert color="error" variant="soft" :title="form.formError.value" />
    </template>
  </UAuthForm>
</template>
```

## Obsługa błędów API

`useForm` automatycznie mapuje błędy z backendu do błędów pól lub błędu ogólnego.

### Format błędów API

Backend zwraca błędy w formacie:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "status": 422,
    "issues": [
      { "path": "email", "message": "Invalid email format" },
      { "path": "password", "message": "Password is required" }
    ]
  }
}
```

### Automatyczne mapowanie

Dla błędów walidacji (422) z `issues`, `useForm` automatycznie mapuje je do `errors`:

```typescript
// Błędy pól
form.errors.value = {
  email: 'Invalid email format',
  password: 'Password is required',
}
```

Dla innych błędów (np. 401, 403), ustawia `formError`:

```typescript
// Błąd ogólny
form.formError.value = 'Invalid credentials'
```

### Ręczne mapowanie błędów

Możesz również ręcznie zmapować błędy:

```typescript
try {
  await auth.login(values)
} catch (error) {
  form.setErrorsFromApi(error)
  throw error // Re-throw dla zewnętrznej obsługi (np. toast)
}
```

## Przykłady

### Przykład 1: Prosty formularz (Login)

```vue
<script setup lang="ts">
  import { LoginInputSchema } from '#shared/schemas/auth'
  import type { InferOutput } from 'valibot'

  const form = useForm(LoginInputSchema)
  const auth = useAuth()

  async function onSubmit(values: InferOutput<typeof LoginInputSchema>) {
    try {
      await auth.login(values)
    } catch (error) {
      form.setErrorsFromApi(error)
      throw error
    }
  }
</script>

<template>
  <UAuthForm :schema="LoginInputSchema" :fields="fields" @submit="form.handleSubmit(onSubmit)">
    <template v-if="form.formError.value" #error>
      <UAlert color="error" variant="soft" :title="form.formError.value" />
    </template>
  </UAuthForm>
</template>
```

### Przykład 2: Formularz z prefill (ResetPassword)

```vue
<script setup lang="ts">
  import { ResetPasswordInputSchema } from '#shared/schemas/auth'
  import type { InferOutput } from 'valibot'

  const route = useRoute()
  const form = useForm(ResetPasswordInputSchema)

  // Prefill z query string
  onMounted(() => {
    const email = route.query.email as string
    const token = route.query.token as string

    if (email || token) {
      form.setValues({
        email: email || undefined,
        token: token || undefined,
      })
    }
  })

  async function onSubmit(values: InferOutput<typeof ResetPasswordInputSchema>) {
    await auth.resetPassword(values)
  }
</script>
```

### Przykład 3: Formularz kontaktowy

```vue
<script setup lang="ts">
  import { ContactFormInputSchema } from '#shared/schemas/api'
  import type { InferOutput } from 'valibot'

  const form = useForm(ContactFormInputSchema)
  const contactResource = useContactResource()

  async function onSubmit(values: InferOutput<typeof ContactFormInputSchema>) {
    try {
      await contactResource.send(values)
      form.reset()
      // Toast sukcesu
    } catch (error) {
      form.setErrorsFromApi(error)
    }
  }
</script>

<template>
  <UForm
    :schema="ContactFormInputSchema"
    :state="form.values"
    @submit="form.handleSubmit(onSubmit)"
  >
    <UFormField label="Imię" name="name" :error="form.errors.name">
      <UInput v-model="form.values.name" />
    </UFormField>

    <UFormField label="Email" name="email" :error="form.errors.email">
      <UInput v-model="form.values.email" type="email" />
    </UFormField>

    <UFormField label="Wiadomość" name="message" :error="form.errors.message">
      <UTextarea v-model="form.values.message" />
    </UFormField>

    <UButton type="submit" :loading="form.pending.value"> Wyślij </UButton>
  </UForm>
</template>
```

## API Reference

### `useForm<T>(schema, options?)`

Tworzy instancję formularza z walidacją Valibot.

**Parametry:**

- `schema: T` - schemat Valibot (BaseSchema)
- `options?: UseFormOptions<T>` - opcje konfiguracji:
  - `initialValues?: Partial<InferInput<T>>` - początkowe wartości formularza
  - `onSubmit?: (values: InferOutput<T>) => Promise<void> | void` - callback submit (opcjonalny)

**Zwraca:** `UseFormReturn<T>`

### Stan formularza

#### `values: Ref<Partial<InferInput<T>>>`

Reaktywne wartości formularza. Może być `Partial` dla prefill.

#### `errors: Ref<Record<string, string>>`

Błędy walidacji pól. Klucz = nazwa pola, wartość = komunikat błędu.

#### `formError: Ref<string | null>`

Błąd ogólny formularza (np. "Invalid credentials"). `null` gdy brak błędu.

#### `pending: Ref<boolean>`

Stan ładowania podczas submit. `true` gdy formularz jest przesyłany.

#### `submitted: Ref<boolean>`

Czy formularz był już submitowany. Przydatne dla UX (np. pokazywanie błędów dopiero po pierwszym submit).

#### `isValid: ComputedRef<boolean>`

Czy formularz jest walidny (brak błędów). `true` gdy `errors` i `formError` są puste.

### Metody

#### `setValues(values: Partial<InferInput<T>>): void`

Ustawia wartości formularza (merge z obecnymi). Automatycznie czyści błędy dla zaktualizowanych pól.

#### `setField(name: string, value: unknown): void`

Ustawia pojedyncze pole formularza.

#### `reset(): void`

Resetuje formularz: wartości, błędy, pending, submitted.

#### `validate(): boolean`

Waliduje wartości formularza przez Valibot. Aktualizuje `errors`. Zwraca `true` jeśli walidacja przeszła.

#### `handleSubmit(callback?): (event: FormSubmitEvent) => Promise<void>`

Zwraca handler dla `@submit` UForm / UAuthForm.

**Flow:**

1. Pobiera dane z `event.data`
2. Ustawia wartości formularza
3. Waliduje formularz
4. Ustawia `pending = true`
5. Wywołuje callback z walidowanymi wartościami
6. Mapuje błędy API do `errors` / `formError`
7. Kończy `pending = false`

**Parametry:**

- `callback?: (values: InferOutput<T>) => Promise<void> | void` - funkcja submit

**Zwraca:** Handler kompatybilny z `@submit` UForm / UAuthForm

#### `setErrorsFromApi(error: unknown): void`

Mapuje błąd API do `errors` / `formError`.

**Obsługiwane formaty:**

- H3Error z `data.error` i `statusCode`
- Error z `message`
- Unknown errors (ustawia domyślny komunikat)

**Logika:**

- Dla 422 z `issues`: mapuje do `errors`
- Dla innych błędów: ustawia `formError`

## Rozszerzenia (future)

API `useForm` zostało zaprojektowane z myślą o rozszerzalności. Planowane rozszerzenia (nie w MVP):

- **`touched`, `dirty`**: tracking zmian w formularzu
- **`autosave` / `localStorage`**: automatyczne zapisywanie draftów
- **`multi-step`**: formularze wieloetapowe
- **`async validation`**: walidacja asynchroniczna (np. sprawdzenie unikalności email)
- **`focus first error`**: automatyczne fokusowanie pierwszego błędu
- **`toasts/redirect hooks`**: automatyczne toasty/redirecty po sukcesie

## Best Practices

1. **Używaj `form.handleSubmit`** zamiast ręcznego wywoływania submit
2. **Obsługuj błędy** przez `form.setErrorsFromApi` w `catch`
3. **Wyświetlaj `formError`** w UI (np. przez `UAlert`)
4. **Używaj `form.pending.value`** dla stanu ładowania przycisku
5. **Prefill przez `form.setValues`** w `onMounted` (nie bezpośrednio do `form.values.value`)
6. **Resetuj formularz** po sukcesie przez `form.reset()`

## Zobacz także

- [Valibot Documentation](https://valibot.dev/)
- [Nuxt UI Form Component](https://ui.nuxt.com/components/form)
- [Nuxt UI AuthForm Component](https://ui.nuxt.com/components/auth-form)
