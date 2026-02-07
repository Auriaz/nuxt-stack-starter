<script setup lang="ts">
import { defineArticle, definePerson } from 'nuxt-schema-org/schema'
import app from '~/app.meta'
import dayjs from 'dayjs'
import { useBlogResource } from '~/composables/resources/useBlogResource'

const route = useRoute()
const { locale } = useI18n()
const blogResource = useBlogResource()

const slug = computed(() => {
  const p = route.params.slug
  return Array.isArray(p) ? p[0] : (p ?? '')
})

const { data: post } = await useAsyncData(
  () => `blog-post-${slug.value}`,
  () => (slug.value ? blogResource.getBySlug(slug.value) : Promise.resolve(null)),
  { watch: [slug], dedupe: 'cancel' }
)

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

const postData = computed(() => post.value!)
const authorAvatarSrc = useAvatarSrc(() => postData.value.authorAvatar ?? undefined)

useSchemaOrg([
  defineArticle({
    headline: postData.value.title,
    description: postData.value.description,
    image: postData.value.imageUrl,
    datePublished: postData.value.publishedAt
      ? dayjs(postData.value.publishedAt).toDate().toISOString()
      : undefined,
    dateModified: postData.value.updatedAt
      ? dayjs(postData.value.updatedAt).toDate().toISOString()
      : undefined,
    keywords: postData.value.tags,
    author: postData.value.authorName
      ? definePerson({
          name: postData.value.authorName,
          image: postData.value.authorAvatar
        })
      : undefined,
    url: blogResource.postPath(postData.value),
    publisher: definePerson({
      name: app.author.name,
      url: app.author.url,
      image: app.author.image.url,
      email: app.author.email
    })
  })
])

useSeoMeta({
  title: () => postData.value.seoTitle || postData.value.title || '',
  ogTitle: () => postData.value.seoTitle || postData.value.title || '',
  description: () => postData.value.seoDesc || postData.value.description || '',
  ogDescription: () => postData.value.seoDesc || postData.value.description || ''
})

defineOgImageComponent('Blog', {
  ogType: 'article',
  publishedTime: postData.value.publishedAt
    ? dayjs(postData.value.publishedAt).toDate().toISOString()
    : undefined,
  authors: postData.value.authorName
    ? [{ name: postData.value.authorName, avatar: { src: postData.value.authorAvatar } }]
    : undefined,
  image: postData.value.imageUrl,
  title: postData.value.seoTitle || postData.value.title,
  description: postData.value.seoDesc || postData.value.description,
  tags: postData.value.tags
})

const config = useRuntimeConfig()
const siteUrl = config.public.siteUrl || 'https://example.com'
const currentUrl = computed(
  () => `${siteUrl}${blogResource.postPath(postData.value)}`
)
const shareText = computed(
  () => `${postData.value.title} - ${postData.value.description ?? ''}`
)

const shareToTwitter = () => {
  if (!postData.value) return
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(currentUrl.value)}`
  navigateTo(url, {
    open: { target: '_blank', windowFeatures: { width: 500, height: 500 } }
  })
}

const shareToFacebook = () => {
  if (!postData.value) return
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}`
  navigateTo(url, {
    open: { target: '_blank', windowFeatures: { width: 500, height: 500 } }
  })
}

const shareToLinkedIn = () => {
  if (!postData.value) return
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl.value)}`
  navigateTo(url, {
    open: { target: '_blank', windowFeatures: { width: 500, height: 500 } }
  })
}

const toast = useToast()
const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(currentUrl.value)
    toast.add({
      title: 'Skopiowano',
      description: 'Link został skopiowany do schowka',
      color: 'success'
    })
  } catch {
    toast.add({
      title: 'Błąd',
      description: 'Nie udało się skopiować linku',
      color: 'error'
    })
  }
}

async function share() {
  await navigator.share({
    title: postData.value.title,
    text: postData.value.description ?? undefined,
    url: currentUrl.value
  })
}

function scrollToId(id: string) {
  if (typeof document === 'undefined') return
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** Id wpisu TOC odpowiadającego aktualnie widocznemu nagłówkowi (scroll spy). */
const activeTocId = ref<string | null>(null)
const TOC_ACTIVE_OFFSET = 100

function updateActiveToc() {
  if (typeof document === 'undefined' || !postData.value.toc?.length) return
  const toc = postData.value.toc
  let current: string | null = null
  for (const entry of toc) {
    const el = document.getElementById(entry.id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= TOC_ACTIVE_OFFSET) {
      current = entry.id
    }
  }
  if (current !== activeTocId.value) {
    activeTocId.value = current ?? toc[0]?.id ?? null
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  updateActiveToc()
  window.addEventListener('scroll', updateActiveToc, { passive: true })
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', updateActiveToc)
})

watch(
  () => postData.value.toc,
  () => { updateActiveToc() },
  { flush: 'post' }
)
</script>

<template>
  <NuxtLayout name="default">
    <UPageHeader
      :title="postData.title"
      :description="postData.description"
      class="container mx-auto py-4 md:pt-14 md:pb-8"
    >
      <template #headline>
        <div class="flex flex-col gap-3 md:gap-2 w-full mb-5">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <UBreadcrumb
              :items="[
                { label: 'Blog', to: '/blog' },
                { label: postData.title, to: blogResource.postPath(postData) }
              ]"
              class="flex-wrap"
            />

            <time
              v-if="postData.publishedAt"
              class="text-muted text-sm flex items-center gap-1 shrink-0"
            >
              <UIcon
                name="i-lucide-calendar"
                class="w-4 h-4"
              />
              {{ dayjs(postData.publishedAt).locale(locale).format('DD.MM.YYYY').toString() }}
            </time>
          </div>
          <USeparator />

          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center gap-2">
              <UAvatar
                v-if="postData.authorName"
                size="sm"
                :src="authorAvatarSrc"
                :alt="postData.authorName"
              />
              <span class="text-sm text-black dark:text-white">{{ postData.authorName }}</span>
            </div>
            <div class="flex items-center flex-wrap gap-2">
              <UBadge
                v-for="(tag, idx) in (postData.tags ?? [])"
                :key="idx"
                :label="tag"
                variant="subtle"
                size="sm"
              />
            </div>
          </div>
        </div>
      </template>

      <USeparator class="my-4 md:my-8" />
      <img
        v-if="postData.imageUrl"
        :src="postData.imageUrl"
        :alt="postData.title"
        class="w-full h-auto rounded-lg"
      >
    </UPageHeader>

    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageBody class="w-full">
        <!-- bodyHtml z API (Markdown → HTML) renderowany przez komponenty Prose z app/components/content -->
        <ContentProseHtml
          v-if="postData.bodyHtml"
          :html="postData.bodyHtml"
          data-testid="blog-body"
          class="max-w-none"
        />

        <AuthorAbout
          :src="authorAvatarSrc"
          :name="postData.authorName"
        />
      </UPageBody>

      <template #right>
        <UPageAside class="hidden lg:block overflow-y-auto">
          <div class="sticky top-4 space-y-4 max-h-[calc(100vh-2rem)]">
            <!-- Udostępnij -->
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
                    v-if="shareToTwitter"
                    icon="i-simple-icons-x"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="shareToTwitter"
                  />
                </UTooltip>
                <UTooltip text="Udostępnij na Facebook">
                  <UButton
                    v-if="shareToFacebook"
                    icon="i-simple-icons-facebook"
                    color="neutral"
                    variant="ghost"
                    size="md"
                    @click="shareToFacebook"
                  />
                </UTooltip>
                <UTooltip text="Udostępnij na LinkedIn">
                  <UButton
                    v-if="shareToLinkedIn"
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

            <!-- Spis treści -->
            <UCard
              v-if="postData.toc?.length"
              :ui="{
                root: 'pt-2 sm:pt-2 pb-2 sm:pb-2 lg:py-2 w-full',
                body: 'pt-0 sm:pt-0 pb-0 sm:pb-0 lg:py-0 w-full'
              }"
              variant="soft"
            >
              <template #header>
                <h3 class="text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2 justify-center">
                  <UIcon
                    name="i-lucide-list"
                    class="w-4 h-4"
                  />
                  Spis treści
                </h3>
              </template>
              <nav
                class="overflow-y-auto w-full py-2"
                aria-label="Spis treści strony"
              >
                <ul class="space-y-1.5 text-sm">
                  <li
                    v-for="entry in postData.toc"
                    :key="entry.id"
                    :class="entry.depth === 2 ? 'pl-0' : entry.depth === 3 ? 'pl-3' : 'pl-6'"
                  >
                    <NuxtLink
                      :to="`#${entry.id}`"
                      class="block py-0.5 transition-colors"
                      :class="activeTocId === entry.id
                        ? 'text-primary font-medium'
                        : 'text-muted hover:text-primary'"
                      @click.prevent="scrollToId(entry.id)"
                    >
                      {{ entry.text }}
                    </NuxtLink>
                  </li>
                </ul>
              </nav>
            </UCard>

            <!-- Powiązane posty -->
            <UCard
              v-if="postData.relatedPosts?.length"
              variant="soft"
            >
              <template #header>
                <h3 class="text-sm font-semibold text-muted uppercase tracking-wide flex items-center gap-2 justify-center">
                  <UIcon
                    name="i-lucide-file-text"
                    class="w-4 h-4"
                  />
                  Powiązane posty
                </h3>
              </template>
              <div class="space-y-3">
                <UCarousel
                  v-slot="{ item }"
                  :items="postData.relatedPosts"
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
                          v-if="item.imageUrl"
                          :src="item.imageUrl"
                          :alt="item.title"
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

            <!-- Kotwice (własne linki) -->
            <UCard
              v-if="postData.anchors?.length"
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
              <nav
                class="overflow-y-auto w-full py-2"
                aria-label="Kotwice strony"
              >
                <ul class="space-y-1.5 text-sm">
                  <li
                    v-for="anchor in postData.anchors"
                    :key="anchor.id"
                  >
                    <NuxtLink
                      :to="anchor.to"
                      :target="anchor.target || undefined"
                      class="text-muted hover:text-primary transition-colors flex items-center gap-2 py-0.5"
                    >
                      <UIcon
                        v-if="anchor.icon"
                        :name="anchor.icon"
                        class="w-4 h-4 shrink-0"
                      />
                      {{ anchor.label }}
                    </NuxtLink>
                  </li>
                </ul>
              </nav>
            </UCard>
          </div>
        </UPageAside>
      </template>
    </UPage>
  </NuxtLayout>
</template>
