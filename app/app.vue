<script setup lang="ts">
  useHead({
    meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    link: [{ rel: 'icon', href: '/favicon.ico' }],
    htmlAttrs: {
      lang: 'pl',
    },
  })

  const title = 'Web Space - Tworzenie Stron Internetowych'
  const description =
    'Profesjonalne tworzenie stron internetowych, aplikacji webowych i e-commerce. Nowoczesne rozwiązania dla Twojego biznesu.'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    // ogImage: '/og-image.png',
    // twitterImage: '/og-image.png',
    // twitterCard: 'summary_large_image',
    // ogType: 'website',
    // ogLocale: 'pl_PL'
  })
</script>

<template>
  <UApp class="m-0 p-0">
    <NuxtPage />
  </UApp>
</template>
