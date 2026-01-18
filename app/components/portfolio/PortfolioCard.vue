<script setup lang="ts">
import type { PortfolioCardProps } from '#shared/types/portfolio'

interface Props {
  project: PortfolioCardProps
}

const props = defineProps<Props>()
</script>

<template>
  <UCard
    :class="[
      'h-full overflow-hidden transition-transform hover:scale-105',
      props.project.featured ? 'lg:col-span-2 lg:row-span-2' : ''
    ]"
  >
    <template #header>
      <div class="relative aspect-video overflow-hidden bg-muted">
        <NuxtImg
          v-if="props.project.coverImage.src"
          :src="props.project.coverImage.src"
          :alt="props.project.coverImage.alt"
          class="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-500 to-primary-700"
        >
          <UIcon
            name="i-lucide-image"
            class="w-16 h-16 text-white opacity-50"
          />
        </div>
        <div
          v-if="props.project.category"
          class="absolute top-4 left-4"
        >
          <UBadge
            color="primary"
            variant="solid"
          >
            {{ props.project.category }}
          </UBadge>
        </div>
        <div
          v-if="props.project.featured"
          class="absolute top-4 right-4"
        >
          <UBadge
            color="primary"
            variant="solid"
            size="lg"
          >
            Wyróżniony
          </UBadge>
        </div>
      </div>
    </template>

    <div>
      <div class="flex items-start justify-between gap-2 mb-2">
        <h3 class="text-xl font-bold">
          {{ props.project.title }}
        </h3>
        <span
          v-if="props.project.year"
          class="text-sm text-muted shrink-0"
        >
          {{ props.project.year }}
        </span>
      </div>
      <p class="text-muted mb-4">
        {{ props.project.excerpt }}
      </p>

      <div
        v-if="props.project.tags.length > 0"
        class="flex flex-wrap gap-2 mb-4"
      >
        <UBadge
          v-for="(tag, index) in props.project.tags"
          :key="index"
          variant="soft"
          color="neutral"
          size="sm"
        >
          {{ tag }}
        </UBadge>
      </div>

      <div class="flex items-center gap-2">
        <UButton
          :to="props.project.to"
          variant="outline"
          size="sm"
        >
          Zobacz projekt
          <UIcon
            name="i-lucide-arrow-right"
            class="w-4 h-4 ml-1"
          />
        </UButton>

        <UButton
          v-if="props.project.externalLink"
          :to="props.project.externalLink.url"
          :target="props.project.externalLink.target || '_blank'"
          variant="ghost"
          size="sm"
          icon="i-lucide-external-link"
        />
      </div>
    </div>
  </UCard>
</template>
