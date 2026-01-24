<script setup lang="ts">
import type { SectionCTA } from '#shared/types/sections'
import PageSection from '~/components/Page/Section/PageSection.vue'

const props = defineProps<{
  section: SectionCTA
}>()

const config = computed(() => ({
  id: props.section.id,
  ref: props.section.ref,
  title: props.section.title,
  description: props.section.description,
  links: props.section.links || [],
  variant: props.section.variant || 'soft',
  reverse: props.section.reverse || false,
  ui: props.section.ui || {}
}))
</script>

<template>
  <PageSection
    :id="section.id"
    :type="section.type"
    :section-ref="section.ref"
    :ui="{
      wrapper: 'hidden'
    }"
  >
    <UPageCTA
      :title="config.title"
      :description="config.description"
      :links="config.links"
      :variant="config.variant"
      :reverse="config.reverse"
      :ui="config.ui"
    >
      <slot />
    </UPageCTA>
  </PageSection>
</template>
