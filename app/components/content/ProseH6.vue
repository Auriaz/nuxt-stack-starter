<template>
  <h6
    :id="props.id"
    class="text-sm font-medium text-gray-700 dark:text-gray-300 my-3"
  >
    <a
      v-if="props.id && generate"
      :href="`${props.id}`"
      class="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <slot />
    </a>
    <slot v-else />
  </h6>
</template>

<script setup lang="ts">
import { computed, useRuntimeConfig } from '#imports'

const props = defineProps<{ id?: string }>()

const { headings } = useRuntimeConfig().public.mdc
const generate = computed(
  () =>
    props.id
    && ((typeof headings?.anchorLinks === 'boolean' && headings?.anchorLinks === true)
      || (typeof headings?.anchorLinks === 'object' && headings?.anchorLinks?.h6))
)
</script>
