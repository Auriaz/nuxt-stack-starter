import type { ContactFormRequest } from '#shared/types/api'

export interface ContactFormOptions {
  endpoint?: string
  method?: 'POST'
  onSuccess?: (data: unknown) => void
  onError?: (error: Error) => void
}

export function useContactForm(options?: ContactFormOptions) {
  const isSubmitting = ref(false)
  const isSubmitted = ref(false)
  const submitError = ref<string | null>(null)
  const toast = useToast()

  const submit = async (data: ContactFormRequest) => {
    isSubmitting.value = true
    submitError.value = null

    try {
      const response = await $fetch<{ success: boolean, message?: string }>(
        options?.endpoint || '/api/contact',
        {
          method: options?.method || 'POST',
          body: data
        }
      )

      if (response.success) {
        isSubmitted.value = true
        options?.onSuccess?.(response)
        toast.add({
          title: 'Sukces',
          description: response.message || 'Wiadomość została wysłana pomyślnie.',
          color: 'success'
        })
      } else {
        throw new Error(response.message || 'Wystąpił błąd podczas wysyłania formularza')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wystąpił błąd podczas wysyłania formularza'
      submitError.value = errorMessage
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage))
      toast.add({
        title: 'Błąd',
        description: errorMessage,
        color: 'error'
      })
    } finally {
      isSubmitting.value = false
    }
  }

  const reset = () => {
    isSubmitted.value = false
    submitError.value = null
  }

  return {
    isSubmitting,
    isSubmitted,
    submitError,
    submit,
    reset
  }
}
