<script setup lang="ts">
import type { SectionCTA, SectionBase } from '#shared/types/sections'
import { defineWebPage } from 'nuxt-schema-org/schema'

interface Props {
  section: SectionCTA
  base: SectionBase
  props: SectionCTA['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  links: props.props?.links || [],
  highlight: props.props?.highlight,
  note: props.props?.note,
  variant: props.props?.variant,
  align: props.base.align || 'center',
  reverse: props.base.reverse || false
}))

// Schema.org
const ctaSchema = computed(() => {
  if (!props.base?.schema?.enabled) return null
  return defineWebPage({
    name: config.value.title,
    description: config.value.description
  })
})

if (ctaSchema.value) {
  useSchemaOrg([ctaSchema.value])
}
</script>

<template>
  <UPageCTA
    :title="config.title"
    :description="config.description"
    :links="config.links"
    :highlight="config.highlight"
    :note="config.note"
    :variant="config.variant"
    :align="config.align"
    :reverse="config.reverse"
  >
    <slot />
  </UPageCTA>
</template>
