<script lang="ts" setup>
import type { SectionBase } from '#shared/types/sections'

const props = defineProps({
  section: {
    type: Object as PropType<SectionBase>,
    required: true
  }
})

const config = computed(() => ({
  type: props.section.type || 'section',
  id: props.section.id || undefined,
  ref: props.section.ref || undefined,
  enabled: props.section.enabled || true,
  headline: props.section.headline || undefined,
  icon: props.section.icon || undefined,
  title: props.section.title || undefined,
  description: props.section.description || undefined,
  links: props.section.links || undefined,
  features: props.section.features || undefined,
  orientation: props.section.orientation || 'horizontal',
  reverse: props.section.reverse || false
}))
</script>

<template>
  <UPageSection
    v-if="config.enabled"
    :id="config.id"
    :ref="config.ref"
    :headline="config.headline"
    :icon="config.icon"
    :title="config.title"
    :description="config.description"
    :features="config.features"
    :orientation="config.orientation"
    :reverse="config.reverse"
  >
    <slot />
  </UPageSection>
</template>
