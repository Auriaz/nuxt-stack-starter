<script setup lang="ts">
import type { SectionHero } from '#shared/types/sections'
import PageSection from '~/components/Page/Section/PageSection.vue'

const props = defineProps<{
  section: SectionHero
}>()

const config = computed(() => ({
  id: props.section.id,
  ref: props.section.ref,
  title: props.section.title,
  description: props.section.description,
  headline: props.section.headline,
  links: props.section.links || [],
  reverse: props.section.reverse || false,
  orientation: props.section.orientation || 'horizontal'
}))

const image = computed(() => ({
  src: props.section.image?.src || '',
  alt: props.section.image?.alt || props.section.title || ''
}))
</script>

<template>
  <PageSection
    :type="section.type"
    :ui="{
      wrapper: 'hidden',
      header: 'max-w-3xl',
      title: 'text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight'
    }"
  >
    <UPageHero
      :ref="config.ref"
      :title="config.title"
      :headline="config.headline"
      :description="config.description"
      :links="config.links"
      :reverse="config.reverse"
      :orientation="section.orientation"
    >
      <NuxtImg
        v-if="image.src"
        :src="image.src"
        :alt="image.alt"
        class="rounded-2xl w-full h-auto shadow-xl ring-1 ring-black/5 dark:ring-white/10"
      />
    </UPageHero>
  </PageSection>
</template>
