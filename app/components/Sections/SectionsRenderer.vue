<script setup lang="ts">
import type { Component } from 'vue'
import type { Section } from '#shared/types/sections'

import SectionsHero from '~/components/Sections/Hero/SectionsHero.vue'
import SectionsFeatures from '~/components/Sections/Features/SectionsFeatures.vue'
import SectionsPricing from '~/components/Sections/Pricing/SectionsPricing.vue'
import SectionsCTA from '~/components/Sections/CTA/SectionsCTA.vue'
import SectionsFAQ from '~/components/Sections/FAQ/SectionsFAQ.vue'
import SectionsTestimonials from '~/components/Sections/Testimonials/SectionsTestimonials.vue'
import SectionsContact from '~/components/Sections/Contact/SectionsContact.vue'

interface Props {
  sections?: Section[]
}

const props = defineProps<Props>()

/**
 * Filtruje sekcje po enabled (default: true)
 */
const enabledSections = computed(() =>
  (props.sections || []).filter(section => section.enabled !== false)
)

const sectionComponents: Record<string, Component> = {
  hero: SectionsHero,
  features: SectionsFeatures,
  pricing: SectionsPricing,
  cta: SectionsCTA,
  faq: SectionsFAQ,
  testimonials: SectionsTestimonials,
  contact: SectionsContact
}
</script>

<template>
  <div class="sections-renderer">
    <component
      :is="sectionComponents[section.type]"
      v-for="(section, index) in enabledSections"
      :key="section.id || `section-${section.type}-${index}`"
      :section="section"
    />
  </div>
</template>
