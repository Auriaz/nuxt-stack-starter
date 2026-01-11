<template>
  <a
    :href="props.href"
    class="text-violet-700 hover:text-green-700 dark:text-violet-500 dark:hover:text-green-500 no-underline font-medium transition-colors duration-300 ease-in-out"
    ><slot
  /></a>
</template>

<script setup lang="ts">
  const props = defineProps<{ href: string }>()
</script>
