<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
// import type { BlogPostEntry } from '#shared/types/content'
import type { BlogCollectionItem } from '@nuxt/content'
import { defineArticle, definePerson } from 'nuxt-schema-org/schema'
import app from '~/app.meta'
import dayjs from 'dayjs'

const { path } = useRoute()
const { locale } = useI18n()

const { data: post } = await useAsyncData(path, () =>
  queryCollection<BlogCollectionItem>('blog').path(path).first()
)
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${path}-surround`, () => {
  return queryCollectionItemSurroundings('blog', path, {
    fields: ['description']
  })
})

const { data: links } = await useAsyncData(`${path}-links`, async () => {
  if (!post.value?.tags || !Array.isArray(post.value.tags)) {
    return []
  }
  const results = await queryCollection('blog').where('path', 'NOT LIKE', post.value.path).all()
  // Sortuj po liczbie wspólnych tagów (najwięcej wspólnych tagów = wyżej)
  const sorted = results
    .map((item) => {
      const commonTags = Array.isArray(item.tags)
        ? item.tags.filter(tag => post.value.tags.includes(tag))
        : []
      return { item, commonTagsCount: commonTags.length }
    })
    .sort((a, b) => b.commonTagsCount - a.commonTagsCount)
    .slice(0, 5)
    .map(({ item }) => item)
  return sorted
})

useSchemaOrg([
  defineArticle({
    headline: post.value.title,
    description: post.value.description,
    image: post.value.image?.src,
    datePublished: dayjs(post.value.date, 'YYYY-MM-DD').toDate().toISOString(),
    dateModified: dayjs(post.value.date, 'YYYY-MM-DD').toDate().toISOString(),
    keywords: post.value.tags?.join(', '),
    author: definePerson({
      name: post.value.authors?.[0]?.name,
      url: post.value.authors?.[0]?.to,
      image: post.value.authors?.[0]?.avatar?.src
    }),
    url: post.value.path,
    publisher: definePerson({
      name: app.author.name,
      url: app.author.url,
      image: app.author.image.url,
      email: app.author.email
    })
  })
])

useSeoMeta({
  title: post.value.seo?.title || post.value.title,
  ogTitle: post.value.seo?.title || post.value.title,
  description: post.value.seo?.description || post.value.description,
  ogDescription: post.value.seo?.description || post.value.description
})

defineOgImageComponent('Blog', {
  ogType: 'article',
  publishedTime: dayjs(post.value.date).toDate().toISOString(),
  authors: post.value.authors,
  image: post.value.image?.src,
  title: post.value.seo?.title || post.value.title,
  description: post.value.seo?.description || post.value.description,
  tags: post.value.tags
})

const config = useRuntimeConfig()
const route = useRoute()
const siteUrl = config.public.siteUrl || 'https://example.com'
const currentUrl = `${siteUrl}${route.path}`
const shareText = computed(() => `${post.value.title} - ${post.value.description}`)

const shareToTwitter = () => {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(currentUrl)}`
  window.open(url, '_blank', 'width=550,height=420')
}

const shareToFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`
  window.open(url, '_blank', 'width=550,height=420')
}

const shareToLinkedIn = () => {
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
  window.open(url, '_blank', 'width=550,height=420')
}

const toast = useToast()

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl)
    toast.add({
      title: 'Skopiowano',
      description: 'Link został skopiowany do schowka',
      color: 'success',
      timeout: 3000
    })
  } catch {
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się skopiować linku',
      color: 'error',
      timeout: 3000
    })
  }
}

async function share() {
  await navigator.share({
    title: post.value.title,
    text: post.value.description,
    url: currentUrl
  })
}
</script>

<template>
  <NuxtLayout name="default">
    <UPageHeader
      :title="post?.title"
      :description="post?.description"
      class="container mx-auto py-4 md:pt-14 md:pb-8"
    >
      <template #headline>
        <div class="flex flex-col gap-3 md:gap-2 w-full mb-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <UBreadcrumb
              :items="[
                { label: 'Blog', to: '/blog' },
                { label: post?.title, to: post?.path }
              ]"
              class="flex-wrap"
            />

            <time
              v-if="post?.date"
              class="text-muted text-sm flex items-center gap-1 shrink-0"
            >
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              {{ dayjs(post.date).locale(locale).format('DD.MM.YYYY').toString() }}
            </time>
          </div>
          <USeparator />

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-2">
              <UAvatar
                size="sm"
                :src="post?.authors?.[0]?.avatar?.src"
                :alt="post?.authors?.[0]?.avatar?.alt"
              />
              <span class="text-sm text-black dark:text-white">{{ post?.authors?.[0]?.name }}</span>
            </div>
            <div class="flex items-center flex-wrap gap-2">
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

      <USeparator class="my-4 md:my-8" />
      <img
        v-if="post?.image?.src"
        :src="post?.image?.src"
        :alt="post?.image?.alt"
        class="w-full h-auto rounded-lg"
      >
    </UPageHeader>
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody class="w-full">
        <ContentRenderer
          v-if="post"
          :value="post"
        />

        <AuthorAbout
          :src="post?.authors?.[0]?.avatar?.src"
          :name="post?.authors?.[0]?.name"
          :description="post?.authors?.[0]?.description"
        />

        <USeparator
          v-if="surround?.length"
          class="my-8"
        />

        <UContentSurround :surround="surround" />
      </UPageBody>

      <template
        #right
      >
        <UPageAside class="hidden lg:block overflow-y-auto">
          <div class="sticky top-4 space-y-4 max-h-[calc(100vh-2rem)]">
            <!-- Anchors -->
            <UCard
              v-if="post?.body?.toc?.links?.length"
              :ui="{
                container: 'pt-2 sm:pt-2 pb-2 sm:pb-2 lg:py-2 w-full',
                body: 'pt-0 sm:pt-0 pb-0 sm:pb-0 lg:py-0 w-full'
              }"
              variant="soft"
            >
              <template #header>
                <h3 class="text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2 justify-center">
                  <UIcon
                    name="i-lucide-anchor"
                    class="w-4 h-4"
                  />
                  Kotwice
                </h3>
              </template>

              <div class="overflow-y-auto w-full py-2">
                <UPageAnchors
                  v-if="post?.anchors"
                  :links="post?.anchors.map(anchor => ({
                    label: anchor.label,
                    to: anchor.to,
                    icon: anchor.icon,
                    target: anchor.target
                  }))"
                />
              </div>
            </UCard>
            <!-- TOC -->
            <UCard
              v-if="post?.body?.toc?.links?.length"
              :ui="{
                container: 'pt-2 sm:pt-2 pb-2 sm:pb-2 lg:py-2 w-full',
                body: 'pt-0 sm:pt-0 pb-0 sm:pb-0 lg:py-0 w-full'
              }"
              variant="soft"
            >
              <template #header>
                <h3 class="text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2 justify-center">
                  <UIcon
                    name="i-lucide-book"
                    class="w-4 h-4"
                  />
                  Spis treści
                </h3>
              </template>

              <div class="overflow-y-auto w-full">
                <UContentToc
                  :links="post.body.toc.links"
                  highlight
                  highlight-color="primary"
                  title="Spis treści strony"
                  color="primary"
                  class="w-full"
                />
              </div>
            </UCard>

            <!-- Social Media -->
            <UCard variant="soft">
              <template #header>
                <h3 class="text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2 justify-center">
                  <UIcon
                    name="i-lucide-share-2"
                    class="w-4 h-4"
                  />
                  Udostępnij
                </h3>
              </template>

              <div class="flex justify-center gap-2">
                <UTooltip text="Udostępnij na Twitter / X">
                  <UButton
                    icon="i-simple-icons-x"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="shareToTwitter"
                  />
                </UTooltip>
                <UTooltip text="Udostępnij na Facebook">
                  <UButton
                    icon="i-simple-icons-facebook"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="shareToFacebook"
                  />
                </UTooltip>
                <UTooltip text="Udostępnij na LinkedIn">
                  <UButton
                    icon="i-simple-icons-linkedin"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="shareToLinkedIn"
                  />
                </UTooltip>
                <UTooltip text="Kopiuj link">
                  <UButton
                    icon="i-lucide-link"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="copyToClipboard"
                  />
                </UTooltip>
                <UTooltip text="Udostępnij przez narzędzia systemowe">
                  <UButton
                    icon="i-lucide-share-2"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="share"
                  />
                </UTooltip>
              </div>
            </UCard>

            <!-- Powiązane artykuły -->
            <UCard
              v-if="links && links.length > 0"
              variant="soft"
            >
              <template #header>
                <h3 class="text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2 justify-center">
                  <UIcon
                    name="i-lucide-link"
                    class="w-4 h-4"
                  />
                  Powiązane posty
                </h3>
              </template>

              <div class="space-y-3">
                <UCarousel
                  v-slot="{ item }"
                  :items="links"
                  loop
                  :autoplay="{ delay: 2000 }"
                  :ui="{ item: '', container: 'gap-4 item-stretch!' }"
                  class="w-full"
                >
                  <NuxtLink
                    :key="item.path"
                    :to="item.path"
                    class="block group"
                  >
                    <div class="flex gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
                      <div class="w-20 h-20 rounded overflow-hidden shrink-0 bg-muted">
                        <NuxtImg
                          v-if="item.image?.src"
                          :src="item.image.src"
                          :alt="item.image.alt || item.title"
                          class="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div
                          v-else
                          class="w-full h-full bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center"
                        >
                          <UIcon
                            name="i-lucide-file-text"
                            class="w-8 h-8 text-white opacity-50"
                          />
                        </div>
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4
                          class="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors"
                        >
                          {{ item.title }}
                        </h4>
                        <p
                          v-if="item.description"
                          class="text-xs text-muted mt-1 line-clamp-2"
                        >
                          {{ item.description }}
                        </p>
                      </div>
                    </div>
                  </NuxtLink>
                </UCarousel>
              </div>
            </UCard>
          </div>
        </UPageAside>
      </template>
    </UPage>
  </NuxtLayout>
</template>
