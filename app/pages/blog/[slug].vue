<script setup lang="ts">
  definePageMeta({
    layout: 'default',
  })

  const route = useRoute()

  const { data: post } = await useAsyncData(route.path, () =>
    queryCollection('blog').path(route.path).first()
  )
  if (!post.value) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
  }

  const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
    return queryCollectionItemSurroundings('blog', route.path, {
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
  <NuxtLayout>
    <UContainer class="space-y-8 h-full bg-white dark:bg-slate-900 overflow-auto">
      <UPage>
        <UPageHeader :title="post?.title" :description="post?.description">
          <template #headline>
            <template v-if="post?.tags && Array.isArray(post.tags) && post.tags.length > 0">
              <UBadge
                v-for="(tag, idx) in post.tags"
                :key="idx"
                :label="typeof tag === 'string' ? tag : String(tag)"
                variant="subtle"
                :class="idx > 0 ? 'ml-2' : ''"
              />
            </template>
            <span
              v-if="post?.tags && Array.isArray(post.tags) && post.tags.length > 0"
              class="text-muted"
              >&middot;</span
            >
            <time v-if="post?.date" class="text-muted">
              {{
                new Date(post.date).toLocaleDateString('en', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              }}
            </time>
          </template>

          <div class="flex flex-wrap items-center gap-3 mt-4" />
        </UPageHeader>

        <UPageBody>
          <ContentRenderer v-if="post" :value="post" />

          <USeparator v-if="surround?.length" />

          <UContentSurround :surround="surround" />
        </UPageBody>

        <template v-if="post?.body?.toc?.links?.length" #right>
          <UContentToc :links="post.body.toc.links" />
        </template>
      </UPage>
    </UContainer>
  </NuxtLayout>
</template>
