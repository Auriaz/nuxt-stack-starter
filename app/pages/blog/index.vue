<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
const { data: posts } = await useAsyncData('blog-posts', () => queryCollection('blog').all())

useSeoMeta({
  title: 'Blog',
  ogTitle: 'Blog',
  description: 'Tutaj znajdziesz wszystkie posty z naszego bloga',
  ogDescription: 'Tutaj znajdziesz wszystkie posty z naszego bloga'
})
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageHeader
        title="Blog"
        description="Tutaj znajdziesz wszystkie posty z naszego bloga"
      />

      <UPageBody>
        <UBlogPosts>
          <UBlogPost
            v-for="(post, index) in posts"
            :key="index"
            :to="post.path"
            :title="post.title"
            :description="post.description"
            :image="post.image"
            :date="formatDateShort(post.date as string | Date, 'en')"
            :authors="post.authors"
            :badge="(post as any).badge?.label"
            :orientation="index === 0 ? 'horizontal' : 'vertical'"
            :class="[index === 0 && 'col-span-full']"
            variant="naked"
            :ui="{
              description: 'line-clamp-2'
            }"
          />
        </UBlogPosts>
      </UPageBody>
    </UPage>
  </NuxtLayout>
</template>
