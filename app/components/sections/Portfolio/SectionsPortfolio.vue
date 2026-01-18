<script setup lang="ts">
import type { SectionPortfolio, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionPortfolio
  base: SectionBase
  props: SectionPortfolio['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  projects: props.props?.projects || [],
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

    <div
      :class="['grid gap-8', gridClasses]"
    >
      <UCard
        v-for="(project, index) in config.projects"
        :key="index"
        :to="project.to"
        variant="outline"
        :class="[
          'overflow-hidden transition-transform hover:scale-105',
          project.featured ? 'lg:col-span-2 lg:row-span-2' : ''
        ]"
      >
        <template
          v-if="project.image"
          #header
        >
          <div class="relative aspect-video overflow-hidden bg-muted">
            <NuxtImg
              :src="project.image.src"
              :alt="project.image.alt || project.title"
              class="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </template>

        <div>
          <h3 class="text-xl font-bold mb-2">
            {{ project.title }}
          </h3>
          <p
            v-if="project.description"
            class="text-muted mb-4"
          >
            {{ project.description }}
          </p>

          <div
            v-if="project.tags && project.tags.length > 0"
            class="flex flex-wrap gap-2"
          >
            <UBadge
              v-for="(tag, tagIndex) in project.tags"
              :key="tagIndex"
              variant="soft"
              color="neutral"
              size="sm"
            >
              {{ tag }}
            </UBadge>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
