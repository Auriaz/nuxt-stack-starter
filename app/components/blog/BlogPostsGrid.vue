<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported w Nuxt 3/4 przez Vite
import type { BlogPostEntry } from '#shared/types/content'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)

const isMobile = computed(() => breakpoints.smaller('md').value)
const isTablet = computed(() => breakpoints.between('md', 'lg').value)
const isDesktop = computed(() => breakpoints.greaterOrEqual('lg').value)

interface Props {
  posts: BlogPostEntry[]
  showFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showFilters: true
})

// Globalny system filtrów (rejestracja strony z filtrami)
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
const selectedYear = ref<string | null>(null)
const sortBy = ref<{ label: string, value: 'newest' | 'oldest' }>({
  label: 'Najnowsze',
  value: 'newest'
})

// Dostępne tagi i lata wyciągnięte z postów
const availableTags = computed(() => {
  const tags = new Set<string>()

  for (const post of props.posts || []) {
    ;(post.tags || []).forEach(tag => tags.add(tag))
  }

  return Array.from(tags).sort()
})

const availableYears = computed(() => {
  const years = new Set<string>()

  for (const post of props.posts || []) {
    if (post.date) {
      // post.date is likely string | Date; new Date(string|Date) is OK
      const year = new Date(post.date as string | number | Date).getFullYear().toString()
      years.add(year)
    }
  }

  return Array.from(years)
    .sort()
    .map(year => ({ label: year, value: year }))
})

// Filtrowane i posortowane posty
const filteredPosts = computed(() => {
  let result = [...(props.posts || [])]

  // Filtrowanie po tagach
  if (selectedTags.value.length > 0) {
    result = result.filter((post) => {
      if (!post.tags || post.tags.length === 0) return false
      const selectedTagValues = selectedTags.value.map((tag) => {
        if (typeof tag === 'string') return tag
        if (typeof tag === 'object' && tag !== null && 'value' in tag) return tag.value
        return String(tag)
      })
      return selectedTagValues.some(tag => post.tags?.includes(tag))
    })
  }

  // Filtrowanie po roku
  if (selectedYear.value) {
    result = result.filter((post) => {
      if (!post.date) return false
      const year = new Date(post.date as string | number | Date).getFullYear().toString()
      return year === selectedYear.value
    })
  }

  // Sortowanie po dacie
  result.sort((a, b) => {
    const dateA = a.date ? new Date(a.date as string | number | Date).getTime() : 0
    const dateB = b.date ? new Date(b.date as string | number | Date).getTime() : 0

    if (sortBy.value.value === 'newest') {
      return dateB - dateA
    }

    return dateA - dateB
  })

  return result
})

// Reset filtrów
const resetFilters = () => {
  selectedTags.value = []
  selectedYear.value = null
  sortBy.value = { label: 'Najnowsze', value: 'newest' } as const
}
</script>

<template>
  <div class="blog-posts-grid">
    <UBlogPosts>
      <UBlogPost
        v-for="(post, index) in filteredPosts"
        :key="post._id || index"
        :to="post.path"
        :title="post.title"
        :description="post.description"
        :image="post.image"
        :date="formatDateShort(post.date as string | Date, 'en')"
        :authors="post.authors"
        :badge="(post as any).badge?.label"
        :orientation="index === 0 ? 'horizontal' : 'vertical'"
        :class="[index === 0 && 'col-span-full']"
        variant="naked"
        :ui="{
          description: 'line-clamp-2'
        }"
      />
    </UBlogPosts>

    <!-- Globalny drawer filtrów -->
    <FiltersDrawer
      v-if="showFilters"
      @reset="resetFilters"
      @apply="() => {}"
    >
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
              { label: 'Najstarsze', value: 'oldest' }
            ]"
            option-attribute="label"
            value-attribute="value"
            placeholder="Sortuj"
            class="w-full sm:w-auto min-w-[140px]"
          />
        </UFormField>

        <UFormField
          v-if="availableTags.length > 0"
          label="Tagi"
          :orientation="isMobile ? 'vertical' : 'horizontal'"
          class="w-full sm:w-auto sm:min-w-[160px] md:min-w-[180px] shrink-0"
        >
          <USelectMenu
            v-model="selectedTags"
            :items="availableTags.map(tag => ({ label: tag, value: tag }))"
            multiple
            searchable
            value-attribute="value"
            placeholder="Tagi"
            class="w-full sm:w-auto min-w-[140px]"
          />
        </UFormField>

        <UFormField
          v-if="availableYears.length > 0"
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
