<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PageEntry } from '#shared/types/content'
import { getPageSections } from '#shared/utils/sections'

definePageMeta({
  layout: 'default'
})

const { path } = useRoute()
const { data: page } = await useAsyncData('home', () =>
  queryCollection<PageEntry>('pages').path(path).first()
)

// Pobierz sekcje z page (z fallback do legacy formatu)
const sections = computed(() => {
  if (!page.value) return []
  return getPageSections(page.value)
})

useSeoMeta({
  title: page.value?.title || 'Nuxt Base Starter',
  description: page.value?.description || 'Profesjonalny starter Nuxt 4 z gotowymi komponentami, SEO baseline, i18n i pełną konfiguracją. Idealny fundament dla Twojego projektu.',
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'w-full min-h-screen' }">
      <UPageBody class="p-0">
        <SectionsRenderer :sections="sections" />
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
