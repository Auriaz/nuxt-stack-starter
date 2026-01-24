<script setup lang="ts">
const filters = useFilters()

defineShortcuts({
  alt_f: () => {
    filters.toggle()
  }
})
</script>

<template>
  <UTooltip
    v-if="filters.hasFilters.value"
    :text="filters.isOpen.value ? 'Zamknij filtry' : 'Filtry'"
    :kbds="['Alt+F']"
  >
    <UButton
      icon="i-lucide-filter"
      variant="ghost"
      color="primary"
      size="sm"
      @click="filters.toggle"
    />
  </UTooltip>
</template>
