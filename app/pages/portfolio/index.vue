<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const title = 'Portfolio - Nuxt Base Starter'
const description
  = 'Zobacz nasze realizacje i projekty. Przykłady profesjonalnych stron internetowych i aplikacji webowych.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})

// Przykładowe projekty portfolio
const projects = [
  {
    title: 'Projekt E-commerce',
    description: 'Nowoczesny sklep internetowy z pełną funkcjonalnością koszyka i płatności.',
    category: 'E-commerce',
    tags: ['Nuxt', 'Vue', 'TypeScript'],
    featured: true
  },
  {
    title: 'Strona Firmowa',
    description: 'Profesjonalna strona internetowa dla firmy z portfolio i blogiem.',
    category: 'Strony WWW',
    tags: ['Nuxt', 'SEO', 'i18n']
  },
  {
    title: 'Aplikacja Webowa',
    description: 'Zaawansowana aplikacja webowa z panelem administracyjnym.',
    category: 'Aplikacje',
    tags: ['Nuxt', 'TypeScript', 'API']
  },
  {
    title: 'Landing Page',
    description: 'Nowoczesna strona landing page z formularzem kontaktowym.',
    category: 'Marketing',
    tags: ['Nuxt', 'Tailwind', 'SEO']
  },
  {
    title: 'Blog Techniczny',
    description: 'Blog z systemem zarządzania treścią i wielojęzycznością.',
    category: 'Content',
    tags: ['Nuxt Content', 'i18n', 'SEO']
  },
  {
    title: 'Dashboard',
    description: 'Panel administracyjny z wykresami i statystykami.',
    category: 'Aplikacje',
    tags: ['Nuxt', 'Charts', 'Dashboard']
  }
]
</script>

<template>
  <NuxtLayout name="default">
    <!-- Page Header -->
    <section class="py-16 bg-muted/50">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            Portfolio
          </h1>
          <p class="text-lg text-muted">
            {{ description }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Portfolio Grid -->
    <section class="py-20">
      <UContainer>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PortfolioCard
            v-for="(project, index) in projects"
            :key="index"
            :title="project.title"
            :description="project.description"
            :category="project.category"
            :tags="project.tags"
            :featured="project.featured"
          />
        </div>
      </UContainer>
    </section>
  </NuxtLayout>
</template>
