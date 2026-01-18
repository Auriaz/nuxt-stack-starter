<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PageEntry } from '#shared/types/content'
import { getPageSections } from '#shared/utils/sections'

definePageMeta({
  layout: 'default'
})

// Pobierz konfigurację strony z content/portfolio/index.md
const { data: page } = await useAsyncData('portfolio-page', () =>
  queryCollection<PageEntry>('pages').path('/portfolio').first()
)

// Pobierz projekty przez composable
const { projects } = usePortfolioContent({
  status: 'published',
  sortBy: 'newest'
})

// Sekcje z page builder
const sections = computed(() => {
  if (!page.value) return []
  return getPageSections(page.value)
})

// SEO Meta
useSeoMeta({
  title: page.value?.title || 'Portfolio',
  description: page.value?.description || 'Zobacz nasze realizacje i projekty',
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody>
        <!-- Page builder sections (hero, etc.) -->
        <SectionsRenderer :sections="sections" />

        <!-- Portfolio Grid z filtrami -->
        <section class="py-20">
          <UContainer>
            <PortfolioGrid :projects="projects || []" />
          </UContainer>
        </section>
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
