<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const title = 'Oferta - Nuxt Base Starter'
const description
  = 'Poznaj naszą ofertę i wybierz plan dopasowany do Twoich potrzeb. Profesjonalne rozwiązania webowe dla każdego projektu.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <!-- Page Header -->
    <section class="py-16 bg-muted/50">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            Nasza oferta
          </h1>
          <p class="text-lg text-muted">
            {{ description }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Pricing Section -->
    <SectionsPricing />

    <!-- FAQ Section -->
    <SectionsFAQ />
  </NuxtLayout>
</template>
