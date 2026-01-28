import type { BaseSchema, InferInput, InferOutput, ValiError } from 'valibot'
import { safeParse } from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

/**
 * Opcje konfiguracji dla useForm
 */
export interface UseFormOptions<T extends BaseSchema> {
  initialValues?: Partial<InferInput<T>>
  onSubmit?: (values: InferOutput<T>) => Promise<void> | void
}

/**
 * Zwracany interfejs z useForm
 */
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

/**
 * Interfejs błędu API z backendu
 */
interface ApiError {
  code: string
  message: string
  issues?: Array<{ path: string, message: string }>
}

/**
 * Composable do zarządzania stanem formularza z walidacją Valibot
 *
 * Zapewnia:
 * - Stan wartości formularza (reactive)
 * - Walidację przy submit
 * - Stan pending podczas submit
 * - Błędy walidacji (pola + ogólny)
 * - Mapowanie błędów z API
 *
 * @example
 * ```ts
 * const form = useForm(LoginInputSchema, {
 *   initialValues: { remember: false }
 * })
 *
 * async function onSubmit(values: InferOutput<typeof LoginInputSchema>) {
 *   await auth.login(values)
 * }
 *
 * // W template:
 * <UForm :schema="LoginInputSchema" :state="form.values" @submit="form.handleSubmit(onSubmit)">
 * ```
 */
export function useForm<T extends BaseSchema>(
  schema: T,
  options?: UseFormOptions<T>
): UseFormReturn<T> {
  // Stan formularza
  const values = ref<Partial<InferInput<T>>>(options?.initialValues || {}) as Ref<
    Partial<InferInput<T>>
  >
  const errors = ref<Record<string, string>>({})
  const formError = ref<string | null>(null)
  const pending = ref(false)
  const submitted = ref(false)

  // Computed: czy formularz jest walidny
  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0 && formError.value === null
  })

  /**
   * Mapuje błędy Valibot do formatu errors
   */
  function mapValibotIssuesToErrors(issues: ValiError['issues']): Record<string, string> {
    const mappedErrors: Record<string, string> = {}
    for (const issue of issues) {
      // issue.path to array: [{ key: 'email' }, { key: '0' }] dla nested
      const path = issue.path?.map(p => String(p.key)).join('.') || 'root'
      mappedErrors[path] = issue.message
    }
    return mappedErrors
  }

  /**
   * Ustawia wartości formularza (merge z obecnymi)
   */
  function setValues(newValues: Partial<InferInput<T>>): void {
    values.value = { ...values.value, ...newValues }
    // Wyczyść błędy dla zaktualizowanych pól, tworząc nowy obiekt bez danych kluczy
    if (Object.keys(errors.value).length) {
      const updatedErrors: Record<string, string> = {}
      for (const [key, message] of Object.entries(errors.value)) {
        if (!(key in newValues)) {
          updatedErrors[key] = message
        }
      }
      errors.value = updatedErrors
    }
  }

  /**
   * Ustawia pojedyncze pole
   */
  function setField(name: string, value: unknown): void {
    setValues({ [name]: value } as Partial<InferInput<T>>)
  }

  /**
   * Resetuje formularz
   */
  function reset(): void {
    values.value = options?.initialValues || {}
    errors.value = {}
    formError.value = null
    pending.value = false
    submitted.value = false
  }

  /**
   * Waliduje wartości formularza przez Valibot
   */
  function validate(): boolean {
    const result = safeParse(schema, values.value)

    if (!result.success) {
      errors.value = mapValibotIssuesToErrors(result.issues)
      formError.value = null
      return false
    }

    errors.value = {}
    formError.value = null
    return true
  }

  /**
   * Mapuje błąd API do errors / formError
   */
  function setErrorsFromApi(error: unknown): void {
    // Sprawdź, czy błąd ma flagę preserveErrors (dla błędów walidacji UI)
    const preserveErrors = (error as { preserveErrors?: boolean })?.preserveErrors
    const existingErrors = preserveErrors ? { ...errors.value } : {}

    // Reset errors (chyba że preserveErrors)
    if (!preserveErrors) {
      errors.value = {}
    }

    // Rozpoznaj format H3Error / $fetch error
    const h3Error = error as {
      data?: { error?: ApiError }
      statusCode?: number
      status?: number
      statusMessage?: string
      statusText?: string
      message?: string
    }

    // Sprawdź statusCode lub status
    const status = h3Error.statusCode || h3Error.status

    // Sprawdź, czy błąd ma data.error (format z useApiClient)
    // Uwaga: $fetch może zwrócić error.data.error jako boolean (true) lub obiekt
    // Struktura może być: error.data.error (obiekt) lub error.data.data.error (obiekt zagnieżdżony)
    const errorData = h3Error.data?.error
    const nestedErrorData = (h3Error.data as { data?: { error?: ApiError } })?.data?.error

    // Sprawdź najpierw zagnieżdżony format (error.data.data.error)
    if (nestedErrorData && typeof nestedErrorData === 'object' && 'message' in nestedErrorData) {
      const apiError = nestedErrorData as ApiError

      // 422 z issues → mapuj do errors
      if (status === 422 && apiError.issues) {
        for (const issue of apiError.issues) {
          const path = issue.path || 'root'
          errors.value[path] = issue.message
        }
        formError.value = null
      } else {
        // Inne błędy (401, 403, 404, etc.) → formError
        formError.value = apiError.message || 'Wystąpił błąd'
        if (!preserveErrors) {
          errors.value = {}
        }
      }
    } else if (errorData && typeof errorData === 'object' && 'message' in errorData) {
      // Sprawdź bezpośredni format (error.data.error)
      const apiError = errorData as ApiError

      // 422 z issues → mapuj do errors
      if (status === 422 && apiError.issues) {
        for (const issue of apiError.issues) {
          const path = issue.path || 'root'
          errors.value[path] = issue.message
        }
        formError.value = null
      } else {
        // Inne błędy (401, 403, 404, etc.) → formError
        formError.value = apiError.message || 'Wystąpił błąd'
        if (!preserveErrors) {
          errors.value = {}
        }
      }
    } else if (h3Error.data && typeof h3Error.data === 'object' && 'error' in h3Error.data) {
      // Błąd ma data.error jako boolean (true) - użyj statusMessage/statusText
      const errorMessage
        = h3Error.statusMessage
          || h3Error.statusText
          || 'Wystąpił błąd'
      formError.value = errorMessage
      if (!preserveErrors) {
        errors.value = {}
      }
    } else if (error instanceof Error) {
      // Dla błędów z preserveErrors, zachowaj istniejące błędy
      if (preserveErrors) {
        errors.value = { ...existingErrors }
        formError.value = null
        // Jeśli błąd ma passwordConfirmError, dodaj go do errors
        const passwordConfirmError = (error as { passwordConfirmError?: string })
          .passwordConfirmError
        if (passwordConfirmError) {
          errors.value.passwordConfirm = passwordConfirmError
        }
      } else {
        // Użyj message z Error lub statusMessage/statusText z H3Error
        // Priorytet: statusMessage > statusText > error.message
        const errorMessage
          = h3Error.statusMessage
            || h3Error.statusText
            || error.message
            || 'Wystąpił nieoczekiwany błąd'
        formError.value = errorMessage
        errors.value = {}
      }
    } else {
      // Dla innych błędów (unknown)
      const errorMessage
        = h3Error.statusMessage
          || h3Error.statusText
          || (typeof error === 'string' ? error : 'Wystąpił nieoczekiwany błąd')
      formError.value = errorMessage
      if (!preserveErrors) {
        errors.value = {}
      }
    }
  }

  /**
   * Zwraca handler dla @submit UForm / UAuthForm
   */
  function handleSubmit(
    callback?: (values: InferOutput<T>) => Promise<void> | void
  ): (event: FormSubmitEvent<InferOutput<T>>) => Promise<void> {
    return async (event: FormSubmitEvent<InferOutput<T>>) => {
      // Pobierz dane z event (UAuthForm używa event.data, UForm też)
      const data = event.data

      // Ustaw wartości z event.data (dla UAuthForm)
      // Uwaga: zapisujemy wszystkie pola, nawet te spoza schematu (np. passwordConfirm)
      if (data && typeof data === 'object') {
        // Zapisz wszystkie pola do values (w tym te spoza schematu)
        values.value = { ...values.value, ...data } as Partial<InferInput<T>>
        // Wyczyść błędy dla zaktualizowanych pól, tworząc nowy obiekt bez danych kluczy
        if (Object.keys(errors.value).length) {
          const updatedErrors: Record<string, string> = {}
          for (const [key, message] of Object.entries(errors.value)) {
            if (!(key in data)) {
              updatedErrors[key] = message
            }
          }
          errors.value = updatedErrors
        }
      }

      // Walidacja - użyj data z eventu, nie values.value (może być niepełne)
      // UAuthForm już zwalidował przez :schema, ale walidujemy ponownie dla bezpieczeństwa
      // i aby uzyskać walidowane wartości (bez pól spoza schematu)
      const dataToValidate = (data && typeof data === 'object' ? data : values.value) as Partial<
        InferInput<T>
      >
      const validationResult = safeParse(schema, dataToValidate)

      if (!validationResult.success) {
        // Mapuj błędy Valibot do errors
        errors.value = mapValibotIssuesToErrors(validationResult.issues)
        formError.value = null
        submitted.value = true
        return
      }

      // Ustaw pending
      pending.value = true
      submitted.value = true
      formError.value = null

      try {
        // Wywołaj callback z walidowanymi wartościami
        if (validationResult.success && callback) {
          await callback(validationResult.output)
        } else if (options?.onSubmit) {
          // Fallback do options.onSubmit
          if (validationResult.success) {
            await options.onSubmit(validationResult.output)
          }
        }
      } catch (error: unknown) {
        // Mapuj błędy API
        setErrorsFromApi(error)

        // Sprawdź, czy błąd ma preserveErrors (błędy walidacji UI)
        // Jeśli tak, nie re-throwuj - zatrzymaj submit, żeby uniknąć pętli
        const preserveErrors = (error as { preserveErrors?: boolean })?.preserveErrors
        if (preserveErrors) {
          // Błąd walidacji UI - zatrzymaj submit, nie re-throwuj
          return
        }

        // Re-throw dla błędów API (useAuth obsługuje toast)
        throw error
      } finally {
        pending.value = false
      }
    }
  }

  return {
    values,
    errors,
    formError,
    pending,
    submitted,
    isValid,
    setValues,
    setField,
    reset,
    validate,
    handleSubmit,
    setErrorsFromApi
  }
}
