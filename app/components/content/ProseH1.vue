<template>
  <h1
    :id="props.id"
    class="text-3xl font-bold my-6 pb-2 text-gray-900 dark:text-gray-100 dark:border-blue-300"
  >
    <slot />
  </h1>
</template>

<script setup lang="ts">
  const props = defineProps<{ id?: string }>()
</script>
