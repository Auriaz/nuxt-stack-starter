<script setup lang="ts">
import type { SectionTestimonials } from '#shared/types/sections'
import type { TestimonialItem } from '#shared/types/common'
import PageSection from '~/components/Page/Section/PageSection.vue'

const props = defineProps<{
  section: SectionTestimonials
}>()

const config = computed(() => ({
  id: props.section.id,
  ref: props.section.ref,
  headline: props.section.headline,
  title: props.section.title,
  description: props.section.description,
  items: (props.section.items || []) as TestimonialItem[],
  layout: props.section.layout || 'grid',
  reverse: props.section.reverse || false,
  ui: props.section.ui || {}
}))

const reviewSchema = computed(() => {
  if (config.value.items.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'review': config.value.items.map(item => ({
      '@type': 'Review',
      'reviewBody': item.quote,
      'author': {
        '@type': 'Person',
        'name': item.author?.name || '',
        'jobTitle': item.author?.role || '',
        'worksFor': item.author?.company
          ? {
              '@type': 'Organization',
              'name': item.author.company
            }
          : undefined
      },
      'reviewRating': typeof item.rating === 'number'
        ? {
            '@type': 'Rating',
            'ratingValue': item.rating,
            'bestRating': 5
          }
        : undefined
    }))
  }
})

if (reviewSchema.value) {
  useSchemaOrg([reviewSchema.value])
}
</script>

<template>
  <PageSection
    :id="section.id"
    :type="section.type"
    :section-ref="section.ref"
    :headline="section.headline"
    :title="section.title"
    :description="section.description"
    :items="section.items"
    :reverse="section.reverse"
    :ui="section.ui"
  >
    <!-- Grid Layout
        <Motion
          v-if="config.layout === 'grid'"
          :variants="staggerList"
          :initial="false"
          class="w-full grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          :class="config.ui.items"
        >
          <CardTestimonial
            v-for="(testimonial, index) in config.items"
            :key="index"
            :testimonial="testimonial"
            :item-class="config.ui.item"
          />
        </Motion>
      -->

    <!-- Carousel Layout -->
    <UCarousel
      v-if="config.layout === 'carousel'"
      v-slot="{ item }"
      :items="(config.items as any)"
      :loop="true"
      :autoplay="{ delay: 2000 }"
      :ui="{
        root: 'w-full',
        item: 'basis-full md:basis-1/2 lg:basis-1/3'
      }"
      arrows
    >
      <CardTestimonial
        :testimonial="(item as TestimonialItem)"
        :item-class="config.ui.item"
      />
    </UCarousel>
  </PageSection>
</template>
