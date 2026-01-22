<script setup lang="ts">
import type { SectionFAQ } from '#shared/types/sections'

const props = defineProps({
  section: {
    type: Object as PropType<SectionFAQ>,
    required: true
  }
})

const config = computed(() => ({
  type: props.section.type || 'faq',
  id: props.section.id || undefined,
  ref: props.section.ref || undefined,
  enabled: props.section.enabled !== false,
  headline: props.section.headline || undefined,
  title: props.section.title || undefined,
  description: props.section.description || undefined,
  items: props.section.items || undefined,
  multiple: props.section.multiple || false,
  orientation: props.section.orientation || 'horizontal',
  reverse: props.section.reverse || false,
  ui: props.section.ui || {}
}))

// Transform items for UAccordion
const accordionItems = computed(() =>
  config.value.items.map((item, index) => ({
    label: item.question,
    icon: item.icon || 'i-lucide-help-circle',
    content: item.answer,
    defaultOpen: index === 0 && !config.value.multiple
  }))
)

// Schema.org FAQPage markup for SEO
const faqSchema = computed(() => {
  if (!config.value.enabled || config.value.items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': config.value.items.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  }
})

if (faqSchema.value) {
  useSchemaOrg([faqSchema.value])
}
</script>

<template>
  <PageSection
    v-if="config.enabled"
    :section="{
      type: config.type,
      id: config.id,
      ref: config.ref,
      enabled: config.enabled,
      headline: config.headline,
      title: config.title,
      description: config.description,
      orientation: config.orientation,
      reverse: config.reverse,
      ui: config.ui
    }"
  >
    <!-- FAQ Accordion -->
    <UAccordion
      :items="accordionItems"
      :multiple="config.multiple"
      :ui="{
        item: 'border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden p-4 text-base'
      }"
      :class="config.ui.items"
    />
  </PageSection>
</template>
