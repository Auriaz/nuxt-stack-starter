<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PageEntry } from '#shared/types/content'
// import { getPageSections } from '#shared/utils/sections'
import appMeta from '~/app.meta'

definePageMeta({
  layout: 'default'
})

const { path } = useRoute()

// Pobierz konfigurację strony z content/kontakt.md
const { data: page } = await useAsyncData('contact-page', () =>
  queryCollection<PageEntry>('pages').path(path).first()
)

// Pobierz sekcje z page
// const sections = computed(() => {
//   if (!page.value) return []
//   return getPageSections(page.value)
// })

// Schema.org
const contactSchema = computed(() => {
  if (!page.value) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    'name': page.value.title,
    'description': page.value.description,
    'mainEntity': {
      '@type': 'Organization',
      'name': appMeta.name,
      'email': appMeta.contactEmail,
      'url': appMeta.url,
      'sameAs': appMeta.sameAs
    }
  }
})

if (contactSchema.value) {
  useSchemaOrg([contactSchema.value])
}

// SEO Meta
useSeoMeta({
  title: page.value?.seo?.title || page.value?.title || 'Kontakt',
  description: page.value?.seo?.description || page.value?.description || 'Skontaktuj się z nami.',
  ogTitle: page.value?.seo?.title || page.value?.title,
  ogDescription: page.value?.seo?.description || page.value?.description,
  ogImage: page.value?.seo?.image,
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <div class="relative isolate overflow-hidden">
      <UPage :ui="{ root: 'relative z-10 py-12 md:py-16' }">
        <UPageBody class="p-0">
          <SectionsRenderer
            v-if="page?.sections"
            :sections="page.sections"
          />
        </UPageBody>
      </UPage>
    </div>
  </NuxtLayout>
</template>
