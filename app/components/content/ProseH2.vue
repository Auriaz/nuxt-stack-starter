<template>
  <h2
    :id="props.id"
    class="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700 pb-2 my-4"
  >
    <a
      v-if="props.id && generate"
      :href="`${props.id}`"
      class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 no-underline font-medium transition-colors duration-300 ease-in-out"
    >
      <slot />
    </a>
    <slot v-else />
  </h2>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'

const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(
  () =>
    props.id
    && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true)
      || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h2))
)
</script>
