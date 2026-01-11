<template>
  <div
    class="relative my-4 bg-gray-800 rounded-lg p-1 leading-relaxed shadow-md transition-colors duration-300 ease-in-out"
  >
    <div
      class="flex items-center rounded-t-lg px-4 py-2 text-gray-500 dark:text-gray-400 bg-slate-950 p-2 rounded-lg"
    >
      <div v-if="language" class="text-sm">
        <span>{{ language }} /</span>
      </div>

      <div v-if="filename" class="text-sm">
        {{ filename }}
      </div>

      <div v-if="meta" class="text-sm text-gray-400">
        {{ meta }}
      </div>

      <div>
        <UButton
          class="absolute top-2 right-2 bg-gray-700 text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 rounded-md px-3 py-1.5 text-sm"
          icon="i-material-symbols-content-copy-outline"
          variant="ghost"
          @click="copyCode"
        />
      </div>
    </div>

    <pre
      :class="$props.class"
      class="overflow-x-auto font-mono text-sm whitespace-pre-line px-4 pt-4"
    >
      <slot />
    </pre>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    code: {
      type: String,
      default: '',
    },
    language: {
      type: String,
      default: null,
    },
    filename: {
      type: String,
      default: null,
    },
    highlights: {
      type: Array as () => number[],
      default: () => [],
    },
    meta: {
      type: String,
      default: null,
    },
    class: {
      type: String,
      default: null,
    },
  })

  const copyCode = () => {
    const codeElement = document.querySelector('pre code')
    if (codeElement) {
      navigator.clipboard
        .writeText(codeElement.textContent || '')
        .then(() => {
          // TODO: Użyj toast notification zamiast alert

          alert('Code copied to clipboard!')
        })
        .catch(() => {
          // Cicho zignoruj błąd kopiowania
        })
    }
  }
</script>

<style scoped>
  /* Removed scoped styles as Tailwind CSS 4 is used for styling */
</style>
