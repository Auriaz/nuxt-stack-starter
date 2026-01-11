<script setup lang="ts">
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
  const route = useRoute()

  const { data: page } = await useAsyncData('blog', () => queryCollection('blog').first())
  const { data: posts } = await useAsyncData(route.path, () => queryCollection('blog').all())

  const title = computed(() => page.value?.seo?.title || page.value?.title)
  const description = computed(() => page.value?.seo?.description || page.value?.description)

  useSeoMeta({
    title,
    ogTitle: title,
    description,
    ogDescription: description,
  })

  defineOgImageComponent('Blog')

  // Upewnij się, że przekazujemy tylko prawidłowe props
  const pageHeaderProps = computed(() => {
    if (!page.value) return {}

    // Filtruj tylko prawidłowe właściwości dla UPageHeader
    // Używamy jawnego przypisania, aby uniknąć przekazania nieprawidłowych właściwości
    const validProps: {
      title?: string
      description?: string
    } = {}

    // Tylko stringi są dozwolone
    if (typeof page.value.title === 'string') {
      validProps.title = page.value.title
    }
    if (typeof page.value.description === 'string') {
      validProps.description = page.value.description
    }

    return validProps
  })

  // Typ dla przetworzonego posta
  interface ProcessedPost {
    path?: string
    to?: string
    title?: string
    description?: string
    image?: string
    date: string | Date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authors?: any[]
    badge?: { label?: string; color?: string }
  }

  // Przetwórz posty, aby upewnić się, że przekazujemy tylko prawidłowe właściwości
  const processedPosts = computed((): ProcessedPost[] => {
    return (
      posts.value?.map((post): ProcessedPost => {
        // Przetwórz image
        let imageValue: string | undefined = undefined
        if (post.image) {
          if (typeof post.image === 'string') {
            imageValue = post.image
          } else if (typeof post.image === 'object' && post.image !== null) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const imageObj = post.image as any
            imageValue = imageObj?.src || imageObj?.url
          }
        }

        // Zwróć tylko dozwolone właściwości dla UBlogPost
        // Nie używamy spread operatora, aby uniknąć przekazania nieprawidłowych właściwości
        const cleanPost: ProcessedPost = {
          path: post.path,
          to: typeof post.to === 'string' ? post.to : undefined,
          title: typeof post.title === 'string' ? post.title : undefined,
          description: typeof post.description === 'string' ? post.description : undefined,
          image: imageValue,
          date: post.date,
        }

        // Dodaj authors tylko jeśli jest tablicą obiektów (nie stringów)
        if (Array.isArray(post.authors) && post.authors.length > 0) {
          // Filtruj tylko obiekty (nie stringi)
          const validAuthors = post.authors.filter((author) => {
            return typeof author === 'object' && author !== null && !Array.isArray(author)
          })
          if (validAuthors.length > 0) {
            cleanPost.authors = validAuthors
          }
        }

        // Dodaj badge tylko jeśli jest obiektem (nie tablicą)
        if (typeof post.badge === 'object' && post.badge !== null && !Array.isArray(post.badge)) {
          cleanPost.badge = post.badge as { label?: string; color?: string }
        }

        return cleanPost
      }) || []
    )
  })
</script>

<template>
  <NuxtLayout>
    <UContainer>
      <UPageHeader v-bind="pageHeaderProps" class="py-[50px]" />

      <UPageBody>
        <UBlogPosts>
          <UBlogPost
            v-for="(post, index) in processedPosts"
            :key="index"
            :to="post.to"
            :title="post.title"
            :description="post.description"
            :image="post.image"
            :date="
              new Date(post.date as string | Date).toLocaleDateString('en', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            "
            :authors="post.authors as any"
            :badge="post.badge?.label"
            :orientation="index === 0 ? 'horizontal' : 'vertical'"
            :class="[index === 0 && 'col-span-full']"
            variant="naked"
            :ui="{
              description: 'line-clamp-2',
            }"
          />
        </UBlogPosts>
      </UPageBody>
    </UContainer>
  </NuxtLayout>
</template>
