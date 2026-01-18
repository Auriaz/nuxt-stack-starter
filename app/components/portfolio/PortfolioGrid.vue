<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PortfolioCardProps } from '#shared/types/portfolio'
import { getPortfolioTags, getPortfolioTechnologies, getPortfolioYears } from '#shared/utils/portfolio'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

const isMobile = computed(() => breakpoints.smaller('md').value)
const isTablet = computed(() => breakpoints.between('md', 'lg').value)
const isDesktop = computed(() => breakpoints.greaterOrEqual('lg').value)

interface Props {
  projects: PortfolioCardProps[]
  showFilters?: boolean
  layout?: 'grid' | 'masonry'
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  layout: 'grid'
})

// Rejestracja filtrów w globalnym systemie
const filters = useFilters()

onMounted(() => {
  if (props.showFilters) {
    filters.register()
  }
})

onUnmounted(() => {
  if (props.showFilters) {
    filters.unregister()
  }
})

// Filtry
const selectedTags = ref<string[]>([])
const selectedTechnologies = ref<string[]>([])
const selectedYear = ref<string | null>(null)
const sortBy = ref<{ label: string, value: 'newest' | 'oldest' | 'featured' }>({ label: 'Najnowsze', value: 'newest' })

// Pobierz dostępne opcje filtrów
const { data: availableTags } = await useAsyncData('portfolio-tags', getPortfolioTags)
const { data: availableTechnologies } = await useAsyncData('portfolio-technologies', getPortfolioTechnologies)
const { data: availableYears } = await useAsyncData('portfolio-years', getPortfolioYears)

// Filtrowane i posortowane projekty
const filteredProjects = computed(() => {
  let result = [...props.projects]

  // Filtrowanie po tagach
  if (selectedTags.value.length > 0) {
    result = result.filter((project) => {
      if (!project.tags || project.tags.length === 0) return false
      // USelectMenu z multiple może zwracać obiekty lub stringi - normalizujemy do stringów
      const selectedTagValues = selectedTags.value.map((tag) => {
        if (typeof tag === 'string') return tag
        if (typeof tag === 'object' && tag !== null && 'value' in tag) return tag.value
        return String(tag)
      })
      return selectedTagValues.some(tag => project.tags?.includes(tag))
    })
  }

  // Filtrowanie po technologiach (używamy tego samego pola tags, które zawiera technologie)
  if (selectedTechnologies.value.length > 0) {
    result = result.filter((project) => {
      if (!project.tags || project.tags.length === 0) return false
      // USelectMenu z multiple może zwracać obiekty lub stringi - normalizujemy do stringów
      const selectedTechValues = selectedTechnologies.value.map((tech) => {
        if (typeof tech === 'string') return tech
        if (typeof tech === 'object' && tech !== null && 'value' in tech) return tech.value
        return String(tech)
      })
      return selectedTechValues.some(tech => project.tags?.includes(tech))
    })
  }

  // Filtrowanie po roku
  if (selectedYear.value) {
    result = result.filter(project => project.year === selectedYear.value)
  }

  // Sortowanie
  if (sortBy.value.value === 'newest') {
    result.sort((a, b) => {
      if (!a.year || !b.year) return 0
      const yearA = parseInt(a.year, 10)
      const yearB = parseInt(b.year, 10)
      return yearB - yearA // Najnowsze pierwsze
    })
  } else if (sortBy.value.value === 'oldest') {
    result.sort((a, b) => {
      if (!a.year || !b.year) return 0
      const yearA = parseInt(a.year, 10)
      const yearB = parseInt(b.year, 10)
      return yearA - yearB // Najstarsze pierwsze
    })
  } else if (sortBy.value.value === 'featured') {
    result.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })
  }

  return result
})

// Reset filtrów
const resetFilters = () => {
  selectedTags.value = []
  selectedTechnologies.value = []
  selectedYear.value = null
  sortBy.value = { label: 'Najnowsze', value: 'newest' } as const
}

// Grid classes
const gridClasses = computed(() => {
  if (props.layout === 'masonry') {
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
  }
  return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
})
</script>

<template>
  <div class="portfolio-grid">
    <!-- Grid projektów -->
    <div
      v-if="filteredProjects.length > 0"
      :class="gridClasses"
    >
      <PortfolioCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
      />
    </div>

    <!-- Brak wyników -->
    <div
      v-else
      class="text-center py-12"
    >
      <p class="text-muted">
        Nie znaleziono projektów spełniających kryteria.
      </p>
      <UButton
        variant="outline"
        class="mt-4"
        @click="resetFilters"
      >
        Resetuj filtry
      </UButton>
    </div>

    <!-- Globalny drawer filtrów (renderowany przez Teleport) -->
    <FiltersDrawer
      v-if="showFilters"
      @reset="resetFilters"
      @apply="() => {}"
    >
      <!-- Zawartość filtrów w drawerze -->
      <div
        :class="[
          'flex w-full max-w-full',
          isMobile ? 'flex-col gap-3' : '',
          isTablet ? 'flex-row flex-wrap gap-3 md:gap-4' : '',
          isDesktop ? 'flex-row flex-wrap gap-4 lg:gap-6' : ''
        ]"
      >
        <UFormField
          label="Sortowanie"
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          class="w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px] shrink-0"
        >
          <USelectMenu
            v-model="sortBy"
            :items="[
              { label: 'Najnowsze', value: 'newest' },
              { label: 'Najstarsze', value: 'oldest' },
              { label: 'Wyróżnione', value: 'featured' }
            ]"
            option-attribute="label"
            value-attribute="value"
            placeholder="Sortuj"
            class="w-full sm:w-auto min-w-[140px]"
          />
        </UFormField>

        <UFormField
          label="Tagi"
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          class="w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px] shrink-0"
        >
          <USelectMenu
            v-model="selectedTags"
            :items="(availableTags || []).map(tag => ({ label: tag, value: tag }))"
            multiple
            searchable
            value-attribute="value"
            placeholder="Tagi"
            class="w-full sm:w-auto min-w-[140px]"
          />
        </UFormField>

        <UFormField
          label="Technologie"
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          class="w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px] shrink-0"
        >
          <USelectMenu
            v-model="selectedTechnologies"
            :items="(availableTechnologies || []).map(tech => ({ label: tech, value: tech }))"
            multiple
            searchable
            value-attribute="value"
            placeholder="Technologie"
            class="w-full sm:w-auto min-w-[140px]"
          />
        </UFormField>

        <UFormField
          v-if="availableYears"
          label="Rok"
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          class="w-full sm:w-auto sm:min-w-[120px] md:min-w-[140px] shrink-0"
        >
          <USelectMenu
            v-model="selectedYear"
            :items="availableYears"
            placeholder="Rok"
            class="w-full sm:w-auto min-w-[100px]"
          />
        </UFormField>
      </div>
    </FiltersDrawer>
  </div>
</template>
