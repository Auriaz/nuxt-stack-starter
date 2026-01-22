<script setup lang="ts">
import type { SectionTestimonials } from '#shared/types/sections'
import type { TestimonialItem } from '#shared/types/common'

const props = defineProps({
  section: {
    type: Object as PropType<SectionTestimonials>,
    required: true
  }
})

const config = computed(() => ({
  type: props.section.type || 'testimonials',
  id: props.section.id || undefined,
  ref: props.section.ref || undefined,
  enabled: props.section.enabled || true,
  headline: props.section.headline || undefined,
  title: props.section.title || undefined,
  description: props.section.description || undefined,
  items: (props.section.items || []) as TestimonialItem[],
  layout: props.section.layout || 'grid',
  orientation: props.section.orientation || 'horizontal',
  reverse: props.section.reverse || false,
  ui: props.section.ui || {}
}))

// Schema.org Review markup for SEO
const reviewSchema = computed(() => {
  if (!config.value.enabled || config.value.items.length === 0) return null

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
    <!-- Grid Layout -->
    <div
      v-if="config.layout === 'grid'"
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      :class="config.ui.items"
    >
      <CardTestimonial
        v-for="(testimonial, index) in config.items"
        :key="index"
        :testimonial="testimonial"
        :item-class="config.ui.item"
      />
    </div>

    <!-- Carousel Layout -->
    <!-- Note: UCarousel expects CarouselItem[] but we pass TestimonialItem[] -->
    <!-- Type assertion (as any) is used to bypass the type mismatch -->
    <!-- Items are properly typed as TestimonialItem in the v-slot -->
    <UCarousel
      v-if="config.layout === 'carousel'"
      v-slot="{ item }"
      :items="(config.items as any)"
      :loop="true"
      :autoplay="{ delay: 2000 }"
      :ui="{
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
