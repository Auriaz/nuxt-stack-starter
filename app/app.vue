<script setup lang="ts">
import dayjs from 'dayjs'

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: {
    lang: 'pl'
  }
})

const title = 'Web Space - Tworzenie Stron Internetowych'
const description
  = 'Profesjonalne tworzenie stron internetowych, aplikacji webowych i e-commerce. Nowoczesne rozwiązania dla Twojego biznesu.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description
  // ogImage: '/images/og-image.png',
  // twitterImage: '/images/og-image.png',
  // twitterCard: 'summary_large_image',
  // ogType: 'website',
  // ogLocale: 'pl_PL'
})

defineOgImageComponent('Blog', {
  ogType: 'website',
  publishedTime: dayjs().toDate().toISOString(),
  authors: [],
  image: '/images/og-image.png',
  title: title,
  description: description,
  tags: []
})

// Plausible Analytics - privacy-first analytics
// Działa tylko jeśli NUXT_PUBLIC_PLAUSIBLE_DOMAIN jest ustawione
const plausibleDomain = useRuntimeConfig().public.plausibleDomain
if (plausibleDomain) {
  useHead({
    script: [
      {
        'src': 'https://plausible.io/js/script.js',
        'defer': true,
        'data-domain': plausibleDomain
      }
    ]
  })
}
</script>

<template>
  <UApp class="m-0 p-0">
    <NuxtPage />
  </UApp>
</template>
