<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import { getPortfolioProject } from '#shared/utils/portfolio'
import dayjs from 'dayjs'

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const slug = route.params.slug as string

// Pobierz projekt
const { data: project } = await useAsyncData(`portfolio-${slug}`, () =>
  getPortfolioProject(slug)
)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Project not found', fatal: true })
}

// Schema.org - używamy WebPage z dodatkowymi polami CreativeWork
const projectSchema = computed(() => {
  // Ręczne tworzenie schema.org dla projektu portfolio (CreativeWork/Project)
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    'name': project.value.title,
    'description': project.value.description || project.value.excerpt,
    'image': project.value.coverImage?.src,
    'datePublished': project.value.publishedAt
      ? dayjs(project.value.publishedAt).toISOString()
      : undefined,
    'keywords': project.value.technologies?.join(', '),
    'url': project.value._path || `/portfolio/${project.value.slug}`
  }
})

if (projectSchema.value) {
  useSchemaOrg([projectSchema.value])
}

// SEO Meta
useSeoMeta({
  title: project.value.seo?.title || project.value.title,
  ogTitle: project.value.seo?.title || project.value.title,
  description: project.value.seo?.description || project.value.description,
  ogDescription: project.value.seo?.description || project.value.description,
  ogImage: project.value.coverImage?.src,
  ogType: 'article'
})

// CTA Section (hardcoded dla case study)
const ctaSection = computed(() => {
  return {
    type: 'cta' as const,
    id: 'cta',
    title: 'Zróbmy coś podobnego',
    description: 'Skontaktuj się z nami, aby omówić Twój projekt',
    align: 'center' as const,
    spacing: 'lg' as const,
    props: {
      actions: [
        {
          label: 'Skontaktuj się',
          to: '/kontakt',
          color: 'primary' as const,
          variant: 'solid' as const,
          size: 'lg' as const
        }
      ],
      variant: 'centered' as const
    }
  }
})
</script>

<template>
  <NuxtLayout name="default">
    <!-- Hero projektu -->
    <PortfolioHero :project="project" />

    <!-- Content (markdown) -->
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody>
        <ContentRenderer
          v-if="project"
          :value="project"
        />

        <!-- Gallery -->
        <div
          v-if="project.gallery && project.gallery.length > 0"
          class="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <NuxtImg
            v-for="(image, index) in project.gallery"
            :key="index"
            :src="image.src"
            :alt="image.alt || `${project.title} - ${index + 1}`"
            class="w-full h-auto rounded-lg"
            loading="lazy"
          />
        </div>
      </UPageBody>
    </UPage>

    <!-- CTA -->
    <SectionsCTA
      :section="ctaSection as any"
      :base="ctaSection as any"
      :props="ctaSection.props"
    />
  </NuxtLayout>
</template>
