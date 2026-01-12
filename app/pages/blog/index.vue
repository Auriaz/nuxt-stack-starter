<script setup lang="ts">
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
  import Fuse from 'fuse.js'
  import type { ModalProps } from '~/components/Modal/Modal.vue'

  const query = ref('')
  const titleQuery = ref('')
  const modalSearch = useTemplateRef<ModalProps | null>('modalSearch')

  const { data: page } = await useAsyncData('blog', () => queryCollection('blog').first())
  const { data: posts } = await useAsyncData('blog-posts', () => queryCollection('blog').all())
  const { data } = await useAsyncData('search-data', () => queryCollectionSearchSections('blog'))

  const fuse = new Fuse(data.value!, {
    keys: ['title', 'description'],
  })

  const tittleFuse = new Fuse(posts.value!, {
    keys: ['title'],
  })

  const filteredPosts = computed(() => {
    if (titleQuery.value.length === 0) return posts.value
    const match = tittleFuse.search(toValue(titleQuery))
    return match.map((result) => result.item)
  })

  const results = computed(() => fuse.search(toValue(query)).slice(0, 10))
  const title = computed(() => page.value?.seo?.title || page.value?.title)
  const description = computed(() => page.value?.seo?.description || page.value?.description)

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
  })

  defineOgImageComponent('Blog')
</script>

<template>
  <NuxtLayout name="default">
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0' }">
      <UPageHeader title="Blog" description="Tutaj znajdziesz wszystkie posty z naszego bloga">
        <template #headline>
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div class="flex-1" />

            <div class="flex items-center gap-2">
              <UInput
                v-model.trim="titleQuery"
                type="text"
                placeholder="Szukaj po tytule"
                class="w-full md:w-64"
              />
              <UButton
                v-if="titleQuery.length > 0"
                icon="i-lucide-x"
                color="primary"
                variant="subtle"
                size="sm"
                @click="titleQuery = ''"
              />
              <UButton
                icon="i-lucide-search"
                color="primary"
                variant="subtle"
                size="sm"
                @click="modalSearch?.open"
              />
            </div>
          </div>
        </template>
      </UPageHeader>

      <UPageBody>
        <UBlogPosts>
          <UBlogPost
            v-for="(post, index) in filteredPosts"
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
              description: 'line-clamp-2',
            }"
          />
        </UBlogPosts>
      </UPageBody>

      <Modal
        ref="modalSearch"
        title="Szukaj wszędzie"
        description="Możesz wyszukać posty po fragmencie, tytule lub treści"
        :ui-box-variants="{ content: 'max-w-3xl' }"
      >
        <template #body>
          <UInput
            v-model="query"
            type="text"
            placeholder="Szukaj wśród wszystkich postów"
            class="w-full"
          />

          <ul class="h-[75svh] overflow-y-auto w-full">
            <li v-for="result in results" :key="result.item.id" class="py-2 w-full">
              <UButton :to="result.item.path" variant="ghost" color="neutral" class="w-full">
                <div class="flex flex-col items-start w-full">
                  <span
                    class="block whitespace-nowrap overflow-hidden text-ellipsis text-lg font-medium dark:text-gray-100 text-gray-900"
                    >{{ result.item.title }}</span
                  >
                  <span
                    class="block w-full whitespace-nowrap overflow-hidden text-ellipsis text-sm leading-relaxed dark:text-gray-400 text-gray-600 line-clamp"
                    >{{ result.item.content }}...</span
                  >
                </div>
              </UButton>
            </li>
          </ul>
        </template>
      </Modal>
    </UPage>
  </NuxtLayout>
</template>
