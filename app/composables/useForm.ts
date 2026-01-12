export interface FormState {
  [key: string]: unknown
}

export interface FormErrors {
  [key: string]: string | undefined
}

export type ValidationRule<T = unknown> = (value: T) => string | true

export interface FieldValidation {
  [key: string]: ValidationRule[]
}

export interface UseFormOptions<T extends FormState> {
  validation?: FieldValidation
  initialValues?: T
  onSubmit?: (values: T) => Promise<void> | void
}

export function useForm<T extends FormState = FormState>(options: UseFormOptions<T> = {}) {
  const state = reactive<T>((options.initialValues || {}) as T)
  const errors = ref<FormErrors>({})
  const isSubmitting = ref(false)
  const isSubmitted = ref(false)
  const submitError = ref<string | null>(null)

  const validate = (): boolean => {
    if (!options.validation) {
      return true
    }

    errors.value = {}
    let isValid = true

    for (const [field, rules] of Object.entries(options.validation)) {
      const value = state[field]
      for (const rule of rules) {
        const result = rule(value)
        if (result !== true) {
          errors.value[field] = result
          isValid = false
          break
        }
      }
    }

    return isValid
  }

  const handleSubmit = async (event?: Event) => {
    if (event) {
      event.preventDefault()
    }

    submitError.value = null
    isSubmitted.value = false

    if (!validate()) {
      return
    }

    isSubmitting.value = true

    try {
      if (options.onSubmit) {
        await options.onSubmit(state as T)
      }
      isSubmitted.value = true
    } catch (error) {
      if (error instanceof Error) {
        submitError.value = error.message
      } else {
        submitError.value = 'Wystąpił błąd podczas wysyłania formularza'
      }
    } finally {
      isSubmitting.value = false
    }
  }

  const reset = () => {
    Object.assign(state, options.initialValues || {})
    errors.value = {}
    isSubmitted.value = false
    submitError.value = null
  }

  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }

  const clearError = (field: string) => {
    errors.value[field] = undefined
  }

  return {
    state,
    errors,
    isSubmitting,
    isSubmitted,
    submitError,
    validate,
    handleSubmit,
    reset,
    setError,
    clearError
  }
}
