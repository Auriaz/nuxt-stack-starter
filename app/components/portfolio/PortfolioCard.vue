<script setup lang="ts">
  interface Props {
    title: string
    description: string
    image?: string
    category?: string
    tags?: string[]
    link?: string
    featured?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    image: undefined,
    category: undefined,
    tags: () => [],
    link: undefined,
    featured: false,
  })
</script>

<template>
  <UCard
    :class="[
      'h-full overflow-hidden transition-transform hover:scale-105',
      props.featured ? 'lg:col-span-2 lg:row-span-2' : '',
    ]"
  >
    <template #header>
      <div class="relative aspect-video overflow-hidden bg-muted">
        <NuxtImg
          v-if="props.image"
          :src="props.image"
          :alt="props.title"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700"
        >
          <UIcon name="i-lucide-image" class="w-16 h-16 text-white opacity-50" />
        </div>
        <div v-if="props.category" class="absolute top-4 left-4">
          <UBadge color="primary" variant="solid">
            {{ props.category }}
          </UBadge>
        </div>
      </div>
    </template>

    <div>
      <h3 class="text-xl font-bold mb-2">
        {{ props.title }}
      </h3>
      <p class="text-muted mb-4">
        {{ props.description }}
      </p>

      <div v-if="props.tags && props.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
        <UBadge
          v-for="(tag, index) in props.tags"
          :key="index"
          variant="soft"
          color="neutral"
          size="sm"
        >
          {{ tag }}
        </UBadge>
      </div>

      <UButton v-if="props.link" :to="props.link" variant="outline" size="sm">
        Zobacz projekt
        <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-1" />
      </UButton>
    </div>
  </UCard>
</template>
