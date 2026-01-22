<script setup lang="ts">
import type { SectionCTA } from '#shared/types/sections'

const props = defineProps({
  cta: {
    type: Object as PropType<SectionCTA>,
    required: true
  }
})

const config = computed(() => ({
  type: props.cta.type || '',
  id: props.cta.id || '',
  ref: props.cta.ref || '',
  enabled: props.cta.enabled || true,
  title: props.cta.title,
  description: props.cta.description,
  links: props.cta?.links || [],
  variant: props.cta?.variant,
  orientation: props.cta.orientation || 'horizontal',
  reverse: props.cta.reverse || false,
  ui: props.cta.ui || {}
}))
</script>

<template>
  <UPageCTA
    v-if="config.enabled"
    :id="config.id"
    :ref="config.ref"
    :title="config.title"
    :description="config.description"
    :links="config.links"
    :orientation="config.orientation"
    :variant="config.variant"
    :reverse="config.reverse"
    :ui="config.ui"
    class="relative z-10 flex justify-center items-center"
  >
    <slot />
  </UPageCTA>
</template>
