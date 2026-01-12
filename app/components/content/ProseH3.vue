<template>
  <h3
    :id="props.id"
    class="text-xl font-semibold text-gray-800 dark:text-gray-200 my-3"
  >
    <a
      v-if="props.id && generate"
      :href="`${props.id}`"
      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200"
    >
      <slot />
    </a>
    <slot v-else />
  </h3>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'

const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(
  () =>
    props.id
    && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true)
      || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h3))
)
</script>
