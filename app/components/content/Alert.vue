<template>
  <UAlert
    :color="alertColor"
    :variant="variant"
    :icon="icon"
    :title="title"
    :description="description"
    :close="closeable"
    :class="alertClassName"
  >
    <!-- Jeśli nie ma title ani description, wyświetl slot jako treść alertu -->
    <template v-if="!title && !description">
      <slot />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
interface Props {
  type?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'subtle'
  icon?: string
  title?: string
  description?: string
  close?: boolean
  closeable?: boolean
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  variant: 'soft',
  closeable: false
})

// Mapuj typ na kolor, jeśli color nie jest bezpośrednio podany
const alertColor = computed(() => {
  if (props.color) {
    return props.color
  }

  // Mapowanie typów na kolory
  const typeColorMap: Record<
    string,
      'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  > = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'error',
    neutral: 'neutral'
  }

  return typeColorMap[props.type] || 'info'
})

// Domyślne ikony dla różnych typów
const icon = computed(() => {
  if (props.icon) {
    return props.icon
  }

  const typeIconMap: Record<string, string> = {
    info: 'i-lucide-info',
    success: 'i-lucide-circle-check',
    warning: 'i-lucide-triangle-alert',
    error: 'i-lucide-circle-x',
    neutral: 'i-lucide-bell'
  }

  return typeIconMap[props.type] || typeIconMap.info
})

// Klasa CSS dla dodatkowego stylowania
const alertClassName = computed(() => {
  return ['my-4', props.className].filter(Boolean).join(' ')
})
</script>

<style scoped>
  /* Dodatkowe style można dodać tutaj, jeśli potrzebne */
</style>
