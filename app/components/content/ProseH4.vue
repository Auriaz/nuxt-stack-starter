<template>
  <h4
    :id="props.id"
    class="text-lg font-medium text-gray-800 dark:text-gray-200 my-2 group"
  >
    <a
      v-if="props.id && generate"
      :href="`${props.id}`"
      class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors duration-200 flex items-center"
    >
      <slot />
    </a>
    <slot v-else />
  </h4>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'

const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(
  () =>
    props.id
    && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true)
      || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h4))
)
</script>
