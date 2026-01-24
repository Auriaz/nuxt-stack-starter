<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PageEntry } from '#shared/types/content'
// import { getPageSections } from '#shared/utils/sections'

definePageMeta({
  layout: 'default'
})

const { path } = useRoute()

// Pobierz konfigurację strony z content/o-nas.md
const { data: page } = await useAsyncData('about-page', () =>
  queryCollection<PageEntry>('pages').path(path).first()
)

// Pobierz sekcje z page (z fallback do legacy formatu)
// const sections = computed(() => {
//   if (!page.value) return []
//   return getPageSections(page.value)
// })

// SEO Meta
useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || 'O nas',
  description: page.value?.seo?.description || page.value?.description || 'Poznaj naszą historię, wartości i zespół.',
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogDescription: page.value?.seo?.description || page.value?.description,
  ogImage: page.value?.seo?.image,
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody>
        <SectionsRenderer
          v-if="page?.sections"
          :sections="page.sections"
        />
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
