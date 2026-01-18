<script setup lang="ts">
import type { SectionSocialProof, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionSocialProof
  base: SectionBase
  props: SectionSocialProof['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  variant: props.props?.variant || 'logos',
  logos: props.props?.logos || [],
  stats: props.props?.stats || [],
  testimonials: props.props?.testimonials || [],
  align: props.base.align || 'center'
}))

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))
</script>

<template>
  <div>
    <div
      v-if="config.title || config.description"
      :class="['mb-8 sm:mb-12 md:mb-16', headerClasses]"
    >
      <h2
        v-if="config.title"
        class="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4"
      >
        {{ config.title }}
      </h2>
      <p
        v-if="config.description"
        class="text-base sm:text-lg text-muted max-w-2xl mx-auto"
      >
        {{ config.description }}
      </p>
    </div>

    <!-- Logos Variant -->
    <div
      v-if="config.variant === 'logos' && config.logos.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 md:gap-10 items-center opacity-60 hover:opacity-100 transition-opacity duration-300"
    >
      <div
        v-for="(logo, index) in config.logos"
        :key="index"
        class="flex items-center justify-center"
      >
        <NuxtImg
          :src="logo.src"
          :alt="logo.alt || 'Logo'"
          class="max-h-12 w-auto object-contain"
          loading="lazy"
        />
      </div>
    </div>

    <!-- Stats Variant -->
    <div
      v-else-if="config.variant === 'stats' && config.stats.length > 0"
      class="grid grid-cols-2 md:grid-cols-4 gap-8"
    >
      <div
        v-for="(stat, index) in config.stats"
        :key="index"
        class="text-center"
      >
        <div
          v-if="stat.icon"
          class="mb-4 flex justify-center"
        >
          <UIcon
            :name="stat.icon"
            class="w-8 h-8 text-primary"
          />
        </div>
        <div class="text-3xl md:text-4xl font-bold mb-2">
          {{ stat.value }}
        </div>
        <div class="text-muted">
          {{ stat.label }}
        </div>
      </div>
    </div>

    <!-- Testimonials Variant -->
    <div
      v-else-if="config.variant === 'testimonials' && config.testimonials.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <UCard
        v-for="(testimonial, index) in config.testimonials"
        :key="index"
        variant="outline"
      >
        <div class="flex items-start gap-4 mb-4">
          <div
            v-if="testimonial.avatar"
            class="shrink-0"
          >
            <NuxtImg
              :src="testimonial.avatar.src"
              :alt="testimonial.avatar.alt || testimonial.name"
              class="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div class="flex-1">
            <div class="font-semibold">
              {{ testimonial.name }}
            </div>
            <div
              v-if="testimonial.role"
              class="text-sm text-muted"
            >
              {{ testimonial.role }}
            </div>
          </div>
        </div>
        <p class="text-muted">
          {{ testimonial.content }}
        </p>
      </UCard>
    </div>
  </div>
</template>
