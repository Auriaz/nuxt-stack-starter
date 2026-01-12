<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const errorMessages: Record<number, { title: string, description: string }> = {
  404: {
    title: 'Strona nie została znaleziona',
    description:
        'Przepraszamy, ale strona, której szukasz, nie istnieje lub została przeniesiona.'
  },
  403: {
    title: 'Brak dostępu',
    description: 'Nie masz uprawnień do przeglądania tej strony.'
  },
  500: {
    title: 'Błąd serwera',
    description: 'Wystąpił błąd po stronie serwera. Spróbuj ponownie za chwilę.'
  },
  503: {
    title: 'Serwis niedostępny',
    description: 'Serwis jest tymczasowo niedostępny. Prosimy spróbować później.'
  }
}

const errorInfo = computed((): { title: string, description: string } => {
  const statusCode = props.error.statusCode
  if (statusCode && statusCode in errorMessages) {
    const message = errorMessages[statusCode as keyof typeof errorMessages]
    if (message) {
      return message
    }
  }
  return {
    title: props.error.message || 'Wystąpił błąd',
    description: 'Coś poszło nie tak. Spróbuj ponownie później.'
  }
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4"
  >
    <div class="max-w-2xl w-full text-center space-y-8">
      <!-- Error Code -->
      <div class="space-y-4">
        <div
          v-if="props.error.statusCode"
          class="inline-block"
        >
          <h1
            class="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-primary-500 to-primary-700 dark:from-primary-400 dark:to-primary-600"
          >
            {{ props.error.statusCode }}
          </h1>
        </div>
        <div
          v-else
          class="inline-block"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-32 h-32 text-primary-500 mx-auto"
          />
        </div>
      </div>

      <!-- Error Message -->
      <div class="space-y-4">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
          {{ errorInfo.title }}
        </h2>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          {{ errorInfo.description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <UButton
          color="primary"
          size="lg"
          icon="i-heroicons-home"
          @click="handleError"
        >
          Powrót do strony głównej
        </UButton>
        <UButton
          variant="outline"
          size="lg"
          icon="i-heroicons-arrow-path"
          @click="handleError"
        >
          Odśwież stronę
        </UButton>
      </div>

      <!-- Additional Info (only in development) -->
      <div
        v-if="props.error.statusMessage"
        class="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-left"
      >
        <p class="text-sm text-slate-600 dark:text-slate-400">
          <strong>Szczegóły błędu:</strong> {{ props.error.statusMessage }}
        </p>
      </div>
    </div>
  </div>
</template>
