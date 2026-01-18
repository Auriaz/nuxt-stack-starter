<script setup lang="ts">
import type { SectionFeatures, SectionBase } from '#shared/types/sections'
import FeatureCard from './FeatureCard.vue'

interface Props {
  section: SectionFeatures
  base: SectionBase
  props: SectionFeatures['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  items: props.props?.items || [],
  layout: props.props?.layout || 'grid',
  columns: props.props?.columns || 3,
  variant: props.props?.variant || 'cards',
  align: props.base.align || 'center'
}))

const gridClasses = computed(() => {
  const cols = config.value.columns
  return {
    'grid-cols-1': true,
    'md:grid-cols-2': cols >= 2,
    'lg:grid-cols-2': cols === 2,
    'lg:grid-cols-3': cols === 3,
    'lg:grid-cols-4': cols === 4
  }
})

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))
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

    <div
      v-if="config.layout === 'grid'"
      :class="['grid gap-8', gridClasses]"
    >
      <FeatureCard
        v-for="(item, index) in config.items"
        :key="index"
        :feature="item"
        :variant="config.variant"
      />
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <FeatureCard
        v-for="(item, index) in config.items"
        :key="index"
        :feature="item"
        :variant="config.variant"
        layout="list"
      />
    </div>
  </div>
</template>
