<script setup lang="ts">
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
  // import type { BlogPostEntry } from '#shared/types/content'
  import type { BlogCollectionItem } from '@nuxt/content'

  const { path } = useRoute()

  const { data: post } = await useAsyncData(path, () =>
    queryCollection<BlogCollectionItem>('blog').path(path).first()
  )
  if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
  }

  const { data: surround } = await useAsyncData(`${path}-surround`, () => {
    return queryCollectionItemSurroundings('blog', path, {
      fields: ['description'],
    })
  })

  const title = post.value.seo?.title || post.value.title
  const description = post.value.seo?.description || post.value.description

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
  })

  defineOgImageComponent('Blog', {
    title: post.value.title,
    description: post.value.description || '',
  })
</script>

<template>
  <NuxtLayout name="default">
    <UPage class="flex flex-col lg:flex-row container mx-auto">
      <UPageHeader :title="post?.title" :description="post?.description" class="py-8">
        <template #headline>
          <div class="flex flex-col gap-2 w-full mb-5">
            <div class="flex items-center justify-between gap-2">
              <UBreadcrumb
                :items="[
                  { label: 'Blog', to: '/blog' },
                  { label: post?.title, to: post?.path },
                ]"
              />

              <time v-if="post?.date" class="text-muted">
                <UIcon name="i-lucide-calendar" />
                {{ formatDateShort(post.date, 'en') }}
              </time>
            </div>
            <USeparator />

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UAvatar
                  size="sm"
                  :src="post?.authors?.[0]?.avatar?.src"
                  :alt="post?.authors?.[0]?.avatar?.alt"
                />
                <span class="text-sm text-black dark:text-white">{{
                  post?.authors?.[0]?.name
                }}</span>
              </div>
              <div class="flex items-center justify-end gap-2">
                <template v-if="post?.tags && Array.isArray(post.tags) && post.tags.length > 0">
                  <UBadge
                    v-for="(tag, idx) in post.tags"
                    :key="idx"
                    :label="typeof tag === 'string' ? tag : String(tag)"
                    variant="subtle"
                    size="sm"
                  />
                </template>
              </div>
            </div>
          </div>
        </template>

        <USeparator class="my-8" />
        <img
          v-if="post?.image?.src"
          :src="post?.image?.src"
          :alt="post?.image?.alt"
          class="w-full h-auto"
        />
      </UPageHeader>

      <UPageBody>
        <ContentRenderer v-if="post" :value="post" />

        <AuthorAbout
          :src="post?.authors?.[0]?.avatar?.src"
          :name="post?.authors?.[0]?.name"
          :description="post?.authors?.[0]?.description"
        />

        <USeparator v-if="surround?.length" />

        <UContentSurround :surround="surround" />
      </UPageBody>

      <template v-if="post?.body?.toc?.links?.length" #right>
        <UPageAside>
          <UContentToc
            :links="post.body.toc.links"
            highlight
            highlight-color="primary"
            color="primary"
          />
        </UPageAside>
      </template>
    </UPage>
  </NuxtLayout>
</template>
