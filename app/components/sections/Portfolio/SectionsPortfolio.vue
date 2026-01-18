<script setup lang="ts">
import type { SectionPortfolio, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionPortfolio
  base: SectionBase
  props: SectionPortfolio['props']
}

const props = defineProps<Props>()

// Pobierz projekty z composable
const { projects } = usePortfolioContent({
  limit: props.props?.limit,
  showFeaturedOnly: props.props?.showFeaturedOnly,
  filterByTags: props.props?.filterByTags,
  filterByTechnologies: props.props?.filterByTechnologies,
  filterByYear: props.props?.filterByYear,
  sortBy: props.props?.sortBy || 'newest'
})

// Konfiguracja layoutu
const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  layout: props.props?.layout || 'grid',
  columns: props.props?.columns || 3,
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

    <!-- Grid z PortfolioCard -->
    <div
      :class="['grid gap-8', gridClasses]"
    >
      <PortfolioCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />
    </div>
  </div>
</template>
