<template>
  <div
    class="relative my-4 bg-gray-800 rounded-lg p-1 leading-relaxed shadow-md transition-colors duration-300 ease-in-out"
  >
    <div
      class="flex items-center rounded-t-lg px-4 py-2 text-gray-200 dark:text-gray-400 bg-slate-950 p-2 rounded-lg"
    >
      <div
        v-if="language"
        class="text-sm"
      >
        <span>{{ language }} /</span>
      </div>

      <div
        v-if="filename"
        class="text-sm"
      >
        {{ filename }}
      </div>

      <div
        v-if="meta"
        class="text-sm text-gray-400"
      >
        {{ meta }}
      </div>

      <div>
        <UButton
          class="absolute top-1.5 right-1.5"
          :icon="isCopied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          variant="soft"
          :color="isCopied ? 'success' : 'neutral'"
          @click="copyCode"
        />
      </div>
    </div>

    <pre
      ref="preElement"
      :class="$props.class"
      class="overflow-x-auto font-mono text-gray-300 dark:text-gray-400 text-sm whitespace-pre-line px-4 pt-4"
    >
      <slot />
    </pre>
  </div>
</template>

<script setup lang="ts">
defineProps({
  code: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: null
  },
  filename: {
    type: String,
    default: null
  },
  highlights: {
    type: Array as () => number[],
    default: () => []
  },
  meta: {
    type: String,
    default: null
  },
  class: {
    type: String,
    default: null
  }
})

const toast = useToast()
const isCopied = ref(false)
const preElement = ref<HTMLPreElement | null>(null)

const copyCode = () => {
  isCopied.value = false

  if (!preElement.value) {
    toast.add({
      title: 'Błąd',
      description: 'Nie znaleziono elementu do skopiowania',
      color: 'error',
      icon: 'i-lucide-copy'
    })
    return
  }

  // Szukaj elementu code wewnątrz tego konkretnego pre
  const codeElement = preElement.value.querySelector('code')
  const textToCopy = codeElement?.textContent || preElement.value.textContent || ''

  if (!textToCopy) {
    toast.add({
      title: 'Błąd',
      description: 'Brak treści do skopiowania',
      color: 'error',
      icon: 'i-lucide-copy'
    })
    return
  }

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      isCopied.value = true
      toast.add({
        title: 'Skopiowano',
        description: 'Kod został skopiowany do schowka',
        color: 'success',
        icon: 'i-lucide-copy'
      })
    })
    .catch(() => {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się skopiować kodu',
        color: 'error',
        icon: 'i-lucide-copy'
      })
    })
    .finally(() => {
      setTimeout(() => {
        isCopied.value = false
      }, 3000)
    })
}
</script>

<style scoped>
  /* Removed scoped styles as Tailwind CSS 4 is used for styling */
</style>
