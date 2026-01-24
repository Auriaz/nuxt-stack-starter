<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PageEntry } from '#shared/types/content'
// import { getPageSections } from '#shared/utils/sections'

definePageMeta({
  layout: 'default'
})

const { path } = useRoute()
const { data: offerPage } = await useAsyncData('offer', () =>
  queryCollection<PageEntry>('pages').path(path).first()
)

// Pobierz sekcje z page (z fallback do legacy formatu)
// const sections = computed(() => {
//   if (!offerPage.value) return []
//   return getPageSections(offerPage.value)
// })

// SEO Meta
useSeoMeta({
  title: offerPage.value?.title || 'Oferta',
  description: offerPage.value?.description || 'Nasza oferta',
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody>
        <SectionsRenderer
          v-if="offerPage?.sections"
          :sections="offerPage.sections"
        />
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
