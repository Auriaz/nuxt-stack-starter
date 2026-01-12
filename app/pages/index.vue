<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  })

  const title = 'Nuxt Base Starter - Solidna podkładka pod strony internetowe'
  const description =
    'Profesjonalny starter Nuxt 4 z gotowymi komponentami, SEO baseline, i18n i pełną konfiguracją. Idealny fundament dla Twojego projektu.'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    twitterCard: 'summary_large_image',
  })
</script>

<template>
  <NuxtLayout name="default">
    <!-- Hero Section -->
    <SectionsHero />

    <!-- Features Section -->
    <SectionsFeatures />

    <!-- Testimonials Section -->
    <SectionsTestimonials />

    <!-- CTA Section -->
    <UiCTA variant="centered" />
  </NuxtLayout>
</template>
