<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import LegalPageLayout from '~/components/Page/Legal/LegalPageLayout.vue'
import type { LegalPage } from '#shared/types/content'

const { data: page } = await useAsyncData('legal-cookies', () =>
  queryCollection<LegalPage>('legal').where('legalKind', '==', 'cookies').first()
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found' })
}

const config = useRuntimeConfig()

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogType: 'website',
  ogUrl: config.public.siteUrl + page.value.path
})
</script>

<template>
  <NuxtLayout name="guest">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0 py-12 md:py-16' }">
      <LegalPageLayout
        :title="page.title"
        :description="page.description"
        :updated-at="page.updatedAt"
        :page="page"
      />
    </UPage>
  </NuxtLayout>
</template>
