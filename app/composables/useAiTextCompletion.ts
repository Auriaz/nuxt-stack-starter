import { ref } from 'vue'

type CompletionMode = 'continue' | 'fix' | 'extend' | 'reduce' | 'simplify' | 'summarize' | 'translate' | 'edit'

export function useAiTextCompletion() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function complete(prompt: string, mode: CompletionMode = 'edit') {
    loading.value = true
    error.value = null
    try {
      const response = await $fetch<string>('/api/ai/completion', {
        method: 'POST',
        body: {
          prompt,
          mode
        },
        responseType: 'text'
      })
      return typeof response === 'string' ? response : String(response)
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udalo sie wygenerowac tresci.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    complete,
    loading,
    error
  }
}
