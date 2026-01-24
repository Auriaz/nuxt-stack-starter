<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { BlogPostEntry } from '#shared/types/content'

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
    <UPage :ui="{ root: 'container mx-auto px-4 py-10 md:px-0' }">
      <UPageHeader
        title="Blog"
        description="Tutaj znajdziesz wszystkie posty z naszego bloga"
      />

      <UPageBody>
        <BlogPostsGrid :posts="posts || []" />
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
