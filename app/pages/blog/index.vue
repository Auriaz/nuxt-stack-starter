<script setup lang="ts">
import type { BlogPostDTO } from '#shared/types/blog'
import PageSection from '~/components/Page/Section/PageSection.vue'
import { useBlogResource } from '~/composables/resources/useBlogResource'

const blogResource = useBlogResource()
const { data: listResponse } = await useAsyncData('blog-posts', () =>
  blogResource.listPublic()
)

const posts = computed(() => listResponse.value?.items ?? [])

/** Mapowanie DTO (Prisma) na kształt oczekiwany przez BlogPostsGrid (path, image, date, authors, _id). */
const postsForGrid = computed(() =>
  posts.value.map((post: BlogPostDTO) => ({
    _id: String(post.id),
    path: blogResource.postPath(post),
    title: post.title,
    description: post.description ?? '',
    image: post.imageUrl ? { src: post.imageUrl, alt: post.title } : undefined,
    date: post.publishedAt ?? '',
    authors: post.authorName
      ? [{ name: post.authorName, avatar: { src: post.authorAvatar ?? '', alt: post.authorName } }]
      : [],
    tags: post.tags ?? []
  }))
)

useSeoMeta({
  title: 'Blog',
  ogTitle: 'Blog',
  description: 'Tutaj znajdziesz wszystkie posty z naszego bloga',
  ogDescription: 'Tutaj znajdziesz wszystkie posty z naszego bloga'
})

onMounted(() => {

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
      :ui="{ root: 'container mx-auto px-4 py-0 md:px-0' }"
    >
      <BlogPostsGrid :posts="postsForGrid" />
    </PageSection>
  </NuxtLayout>
</template>
