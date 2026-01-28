<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { BlogPostEntry } from '#shared/types/content'
import PageSection from '~/components/Page/Section/PageSection.vue'

const { data: posts } = await useAsyncData('blog-posts', () =>
  queryCollection<BlogPostEntry>('blog').all()
)

useSeoMeta({
  title: 'Blog',
  ogTitle: 'Blog',
  description: 'Tutaj znajdziesz wszystkie posty z naszego bloga',
  ogDescription: 'Tutaj znajdziesz wszystkie posty z naszego bloga'
})
</script>

<template>
  <NuxtLayout name="default">
    <PageSection
      id="blog-section"
      ref="blog-section"
      title="Blog"
      description="Tutaj znajdziesz wszystkie posty z naszego bloga"
      type="section"
      :ui="{ root: 'container mx-auto px-4 py-0 md:px-0', content: 'space-y-8' }"
    >
      <BlogPostsGrid :posts="posts || []" />
    </PageSection>
  </NuxtLayout>
</template>
