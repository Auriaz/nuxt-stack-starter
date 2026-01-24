<script setup lang="ts">
import type { SectionFAQ } from '#shared/types/sections'
import PageSection from '~/components/Page/Section/PageSection.vue'

const props = defineProps<{
  section: SectionFAQ
}>()

const config = computed(() => ({
  id: props.section.id,
  ref: props.section.ref,
  headline: props.section.headline,
  title: props.section.title,
  description: props.section.description,
  items: props.section.items || [],
  multiple: props.section.multiple || false,
  reverse: props.section.reverse || false,
  ui: props.section.ui || {}
}))

const accordionItems = computed(() =>
  config.value.items.map((item, index) => ({
    label: item.question,
    icon: item.icon || 'i-lucide-help-circle',
    content: item.answer,
    defaultOpen: index === 0 && !config.value.multiple
  }))
)

const faqSchema = computed(() => {
  if (config.value.items.length === 0) return null

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
    :headline="section.headline"
    :title="section.title"
    :description="section.description"
    :items="section.items"
    :multiple="section.multiple"
    :reverse="section.reverse"
    :ui="section.ui"
    :type="section.type"
  >
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
