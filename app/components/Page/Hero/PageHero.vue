<script setup lang="ts">
import type { SectionHero } from '#shared/types/sections'

const props = defineProps({
  hero: {
    type: Object as PropType<SectionHero>,
    required: true
  }
})

const config = computed(() => ({
  id: props.hero.id || undefined,
  ref: props.hero.ref || undefined,
  title: props.hero.title || undefined,
  description: props.hero.description || undefined,
  headline: props.hero.headline || undefined,
  links: props.hero.links || [],
  orientation: props.hero.orientation || 'horizontal',
  reverse: props.hero.reverse || false,
  enabled: props.hero.enabled || true
}))

const image = computed(() => ({
  src: props.hero.image?.src || '',
  alt: props.hero.image?.alt || ''
}))
</script>

<template>
  <UPageHero
    v-if="config.enabled"
    :id="config.id"
    :ref="config.ref"
    :title="config.title"
    :headline="config.headline"
    :description="config.description"
    :links="config.links"
    :orientation="config.orientation"
    :reverse="config.reverse"
  >
    <NuxtImg
      v-if="image.src"
      :src="image.src"
      :alt="image.alt"
      class="rounded-lg w-full h-auto shadow-2xl ring ring-default"
    />
  </UPageHero>
</template>
