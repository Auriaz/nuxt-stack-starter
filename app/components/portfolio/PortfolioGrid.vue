<script setup lang="ts">
import type { PortfolioCardProps } from '#shared/types/portfolio'
import { getPortfolioTags, getPortfolioTechnologies, getPortfolioYears } from '#shared/utils/portfolio'

interface Props {
  projects: PortfolioCardProps[]
  showFilters?: boolean
  layout?: 'grid' | 'masonry'
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: true,
  layout: 'grid'
})

// Filtry
const selectedTags = ref<string[]>([])
const selectedTechnologies = ref<string[]>([])
const selectedYear = ref<string | null>(null)
const sortBy = ref<'newest' | 'oldest' | 'featured'>('newest')

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
      return selectedTags.value.some(tag => project.tags.includes(tag))
    })
  }

  // Filtrowanie po technologiach (używamy tego samego pola tags, które zawiera technologie)
  if (selectedTechnologies.value.length > 0) {
    result = result.filter((project) => {
      if (!project.tags || project.tags.length === 0) return false
      return selectedTechnologies.value.some(tech => project.tags.includes(tech))
    })
  }

  // Filtrowanie po roku
  if (selectedYear.value) {
    result = result.filter(project => project.year === selectedYear.value)
  }

  // Sortowanie
  if (sortBy.value === 'newest') {
    result.sort((a, b) => {
      if (!a.year || !b.year) return 0
      const yearA = parseInt(a.year, 10)
      const yearB = parseInt(b.year, 10)
      return yearB - yearA // Najnowsze pierwsze
    })
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => {
      if (!a.year || !b.year) return 0
      const yearA = parseInt(a.year, 10)
      const yearB = parseInt(b.year, 10)
      return yearA - yearB // Najstarsze pierwsze
    })
  } else if (sortBy.value === 'featured') {
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
  sortBy.value = 'newest'
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
    <!-- Filtry -->
    <div
      v-if="showFilters"
      class="mb-8 space-y-4"
    >
      <div class="flex flex-wrap items-center gap-4">
        <!-- Sortowanie -->
        <USelectMenu
          v-model="sortBy"
          :options="[
            { label: 'Najnowsze', value: 'newest' },
            { label: 'Najstarsze', value: 'oldest' },
            { label: 'Wyróżnione', value: 'featured' }
          ]"
          option-attribute="label"
          value-attribute="value"
          placeholder="Sortuj"
        />

        <!-- Filtry tagów -->
        <USelectMenu
          v-model="selectedTags"
          :options="availableTags || []"
          multiple
          placeholder="Filtruj po tagach"
          searchable
        />

        <!-- Filtry technologii -->
        <USelectMenu
          v-model="selectedTechnologies"
          :options="availableTechnologies || []"
          multiple
          placeholder="Filtruj po technologiach"
          searchable
        />

        <!-- Filtry roku -->
        <USelectMenu
          v-model="selectedYear"
          :options="availableYears || []"
          placeholder="Filtruj po roku"
        />

        <!-- Reset -->
        <UButton
          variant="ghost"
          size="sm"
          @click="resetFilters"
        >
          Resetuj
        </UButton>
      </div>

      <!-- Aktywne filtry -->
      <div
        v-if="selectedTags.length > 0 || selectedTechnologies.length > 0 || selectedYear"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="tag in selectedTags"
          :key="`tag-${tag}`"
          color="primary"
          variant="soft"
          size="sm"
        >
          {{ tag }}
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="xs"
            color="primary"
            class="ml-1 -mr-1"
            @click="selectedTags = selectedTags.filter(t => t !== tag)"
          />
        </UBadge>
        <UBadge
          v-for="tech in selectedTechnologies"
          :key="`tech-${tech}`"
          color="primary"
          variant="soft"
          size="sm"
        >
          {{ tech }}
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="xs"
            color="primary"
            class="ml-1 -mr-1"
            @click="selectedTechnologies = selectedTechnologies.filter(t => t !== tech)"
          />
        </UBadge>
        <UBadge
          v-if="selectedYear"
          color="primary"
          variant="soft"
          size="sm"
        >
          {{ selectedYear }}
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="xs"
            color="primary"
            class="ml-1 -mr-1"
            @click="selectedYear = null"
          />
        </UBadge>
      </div>
    </div>

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
  </div>
</template>
