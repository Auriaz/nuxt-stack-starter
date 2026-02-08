<script setup lang="ts">
import dayjs from 'dayjs'

defineOptions({
  inheritAttrs: false
})

interface Author {
  name?: string
  avatar?: {
    src?: string
    alt?: string
  }
  to?: string
}

interface Props {
  title: string
  description?: string
  authors?: Author[]
  publishedTime?: string
  tags?: string[]
  image?: string
  ogType?: string
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  authors: () => [],
  publishedTime: undefined,
  tags: () => [],
  image: undefined,
  ogType: 'article'
})

const firstAuthor = computed(() => props.authors?.[0])
const formattedDate = computed(() => {
  if (!props.publishedTime) return ''
  return dayjs(props.publishedTime).format('DD MMMM YYYY')
})
</script>

<template>
  <div
    class="w-full h-full flex flex-col justify-between p-16 relative overflow-hidden"
    style="background-color: #1a2332"
  >
    <!-- Obraz tła (jeśli dostępny) -->

    <img
      v-if="image"
      :src="image"
      :alt="title"
      class="absolute top-0 left-0 w-full h-full object-cover"
    >
    <div
      class="absolute top-0 left-0 w-full h-full"
      style="background-color: rgba(15, 23, 42, 0.6)"
    />

    <!-- Dekoracyjne elementy tła -->
    <div
      class="absolute top-0 right-0 w-96 h-96 rounded-full"
      style="background-color: rgba(59, 130, 246, 0.1); transform: translate(192px, -192px)"
    />
    <div
      class="absolute bottom-0 left-0 w-96 h-96 rounded-full"
      style="background-color: rgba(99, 102, 241, 0.1); transform: translate(-192px, 192px)"
    />

    <!-- Główna zawartość -->
    <div class="relative flex-1 flex flex-col justify-center">
      <!-- Badge/Brand -->
      <div class="mb-6 flex items-center justify-center">
        <div
          class="px-6 py-2 rounded-full border"
          style="background-color: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3)"
        >
          <span class="text-white text-lg font-semibold tracking-wide">{{ ogType }}</span>
        </div>
      </div>

      <!-- Tytuł -->
      <h1 class="text-6xl font-bold text-white mb-8 leading-tight max-w-5xl mx-auto text-center">
        {{ title }}
      </h1>

      <!-- Opis -->
      <p
        v-if="description"
        class="text-2xl text-gray-200 leading-relaxed max-w-4xl mx-auto text-center mb-6 font-light"
      >
        {{ description }}
      </p>

      <!-- Meta informacje -->
      <div class="flex items-center justify-center gap-6 mt-8 flex-wrap">
        <!-- Autor -->
        <div
          v-if="firstAuthor?.name"
          class="flex items-center gap-3"
        >
          <img
            v-if="firstAuthor.avatar?.src"
            :src="firstAuthor.avatar.src"
            :alt="firstAuthor.avatar.alt || firstAuthor.name"
            class="w-10 h-10 rounded-full border-2"
            style="border-color: rgba(255, 255, 255, 0.3)"
          >
          <div
            v-else
            class="w-10 h-10 rounded-full border-2 flex items-center justify-center"
            style="background-color: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3)"
          >
            <span class="text-white font-semibold">{{ firstAuthor.name.charAt(0) }}</span>
          </div>
          <span class="text-white/90 text-lg font-medium">{{ firstAuthor.name }}</span>
        </div>

        <!-- Data -->
        <div
          v-if="formattedDate"
          class="flex items-center gap-2 text-white/80"
        >
          <span class="text-lg">{{ formattedDate }}</span>
        </div>
      </div>

      <!-- Tagi -->
      <div
        v-if="tags && tags.length > 0"
        class="flex items-center justify-center gap-2 mt-6 flex-wrap"
      >
        <span
          v-for="(tag, idx) in tags.slice(0, 3)"
          :key="idx"
          class="px-3 py-1 rounded-full text-sm border text-white"
          style="background-color: rgba(255, 255, 255, 0.2); border-color: rgba(255, 255, 255, 0.3)"
        >
          {{ tag }}
        </span>
        <span
          v-if="tags.length > 3"
          class="text-white/70 text-sm"
        >
          +{{ tags.length - 3 }} więcej
        </span>
      </div>
    </div>

    <!-- Footer z dekoracyjną linią -->
    <div class="relative  flex items-center gap-4">
      <div
        class="flex-1 h-px"
        style="background-color: rgba(255, 255, 255, 0.3)"
      />
      <div
        class="w-2 h-2 rounded-full"
        style="background-color: rgba(255, 255, 255, 0.5)"
      />
      <div
        class="flex-1 h-px"
        style="background-color: rgba(255, 255, 255, 0.3)"
      />
    </div>
  </div>
</template>
