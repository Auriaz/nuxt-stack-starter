<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PortfolioProjectEntry } from '#shared/types/content'

definePageMeta({
  layout: 'default'
})

// Pobierz konfigurację strony z content/portfolio/index.md
const { data: page } = await useAsyncData('portfolio-page', () =>
  queryCollection<PortfolioProjectEntry>('portfolio').first()
)

// Pobierz projekty przez composable
const { projects } = usePortfolioContent({
  status: 'published',
  sortBy: 'newest'
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
    <UPage :ui="{ root: 'relative container mx-auto px-2 md:px-0' }">
      <UPageBody>
        <PageSection
          id="portfolio-section"
          ref="portfolio-section"
          type="portfolio"
          :title="projects?.title || 'Nasze Portfolio'"
          :description="projects?.description || 'Zobacz nasze realizacje i projekty'"
          :reverse="false"
          :ui="{
            root: 'relative container mx-auto px-2 md:px-0',
            container: 'max-w-7xl mx-auto',
            content: ''
          }"
        >
          <PortfolioGrid :projects="projects || []" />
        </PageSection>
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
