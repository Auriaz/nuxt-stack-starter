<script setup lang="ts">
import type { SectionFAQ, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionFAQ
  base: SectionBase
  props: SectionFAQ['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  items: props.props?.items || [],
  variant: props.props?.variant || 'accordion',
  defaultOpen: props.props?.defaultOpen ?? 0,
  align: props.base.align || 'center'
}))

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))

// Schema.org FAQPage
const faqSchema = computed(() => {
  if (!props.base?.schema?.enabled) return null

  // Ręczne tworzenie FAQPage schema (defineFAQPage może nie być dostępne)
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
  <div>
    <div
      v-if="config.title || config.description"
      :class="['mb-12', headerClasses]"
    >
      <h2
        v-if="config.title"
        class="text-3xl md:text-4xl font-bold mb-4"
      >
        {{ config.title }}
      </h2>
      <p
        v-if="config.description"
        class="text-lg text-muted max-w-2xl mx-auto"
      >
        {{ config.description }}
      </p>
    </div>

    <!-- Accordion Variant -->
    <div
      v-if="config.variant === 'accordion'"
      class="max-w-3xl mx-auto space-y-4"
    >
      <UAccordion
        :items="
          config.items.map((item, index) => ({
            label: item.question,
            content: item.answer,
            defaultOpen: index === config.defaultOpen
          }))
        "
        color="primary"
        variant="soft"
        size="lg"
      />
    </div>

    <!-- List Variant -->
    <div
      v-else
      class="max-w-3xl mx-auto space-y-6"
    >
      <div
        v-for="(item, index) in config.items"
        :key="index"
        class="border-b border-border pb-6"
      >
        <h3 class="text-xl font-semibold mb-2">
          {{ item.question }}
        </h3>
        <p class="text-muted">
          {{ item.answer }}
        </p>
      </div>
    </div>
  </div>
</template>
