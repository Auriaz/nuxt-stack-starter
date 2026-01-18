<script setup lang="ts">
import type { SectionHero, SectionBase } from '#shared/types/sections'
import { defineWebPage } from 'nuxt-schema-org/schema'

interface Props {
  section: SectionHero
  base: SectionBase
  props: SectionHero['props']
}

const props = defineProps<Props>()

// Merge base + props
const config = computed(() => ({
  title: props.base.title || '',
  subtitle: props.base.subtitle || props.base.eyebrow || '',
  description: props.base.description || '',
  eyebrow: props.base.eyebrow || props.base.subtitle || '',
  layout: props.props?.layout || 'centered',
  variant: props.props?.variant || 'primary',
  image: props.props?.image,
  actions: props.props?.actions || [],
  badges: props.props?.badges || []
}))

// Computed dla klas layoutu
const layoutClasses = computed(() => {
  const layout = config.value.layout
  switch (layout) {
    case 'split':
      return 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'
    case 'full-width':
      return 'relative'
    case 'centered':
    default:
      return 'text-center max-w-4xl mx-auto'
  }
})

// Computed dla image position w layout split
const imageOrder = computed(() => {
  if (!config.value.image?.position) return 'order-2'
  return config.value.image.position === 'left' ? 'order-1' : 'order-2'
})

const textOrder = computed(() => {
  if (!config.value.image?.position) return 'order-1'
  return config.value.image.position === 'left' ? 'order-2' : 'order-1'
})

// Computed dla full-width background image
const backgroundImageStyle = computed(() => {
  if (config.value.layout !== 'full-width' || !config.value.image) return null
  return {
    backgroundImage: `url(${config.value.image.src})`,
    backgroundSize: config.value.image.objectFit || 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }
})

// Schema.org
const heroSchema = computed(() => {
  if (!props.base?.schema?.enabled) return null
  return defineWebPage({
    name: config.value.title,
    description: config.value.description || config.value.subtitle,
    image: config.value.image?.src
  })
})

if (heroSchema.value) {
  useSchemaOrg([heroSchema.value])
}
</script>

<template>
  <div>
    <!-- Full-width Layout -->
    <div
      v-if="config.layout === 'full-width'"
      :style="backgroundImageStyle"
      class="relative min-h-[600px] flex items-center"
    >
      <div class="absolute inset-0 bg-black/50" />
      <div class="relative z-10 w-full">
        <div :class="layoutClasses">
          <UBadge
            v-if="config.eyebrow"
            color="primary"
            variant="soft"
            class="mb-4"
          >
            {{ config.eyebrow }}
          </UBadge>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            {{ config.title }}
          </h1>
          <p
            v-if="config.subtitle"
            class="text-xl md:text-2xl mb-4 text-white/90"
          >
            {{ config.subtitle }}
          </p>
          <p
            v-if="config.description"
            class="text-lg mb-8 text-white/80 max-w-2xl mx-auto"
          >
            {{ config.description }}
          </p>
          <div
            v-if="config.actions.length > 0"
            class="flex flex-wrap gap-4 justify-center"
          >
            <UButton
              v-for="(action, index) in config.actions"
              :key="index"
              :to="action.to"
              :target="action.target || '_self'"
              :color="action.color || 'primary'"
              :variant="action.variant || 'solid'"
              :size="action.size || 'lg'"
              :icon="action.icon"
            >
              {{ action.label }}
            </UButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Split Layout -->
    <div
      v-else-if="config.layout === 'split'"
      :class="layoutClasses"
    >
      <div :class="textOrder">
        <UBadge
          v-if="config.eyebrow"
          color="primary"
          variant="soft"
          class="mb-4"
        >
          {{ config.eyebrow }}
        </UBadge>
        <h1 class="text-4xl md:text-5xl font-bold mb-6">
          {{ config.title }}
        </h1>
        <p
          v-if="config.subtitle"
          class="text-xl md:text-2xl mb-4 text-muted"
        >
          {{ config.subtitle }}
        </p>
        <p
          v-if="config.description"
          class="text-lg mb-8 text-muted"
        >
          {{ config.description }}
        </p>
        <div
          v-if="config.actions.length > 0"
          class="flex flex-wrap gap-4"
        >
          <UButton
            v-for="(action, index) in config.actions"
            :key="index"
            :to="action.to"
            :target="action.target || '_self'"
            :color="action.color || 'primary'"
            :variant="action.variant || 'solid'"
            :size="action.size || 'lg'"
            :icon="action.icon"
          >
            {{ action.label }}
          </UButton>
        </div>
      </div>
      <div
        v-if="config.image"
        :class="imageOrder"
      >
        <div class="relative rounded-lg overflow-hidden">
          <NuxtImg
            :src="config.image.src"
            :alt="config.image.alt || config.title"
            class="w-full h-full object-cover"
            loading="eager"
            format="webp"
          />
        </div>
      </div>
    </div>

    <!-- Centered Layout (default) -->
    <div
      v-else
      :class="layoutClasses"
    >
      <UBadge
        v-if="config.eyebrow"
        color="primary"
        variant="soft"
        class="mb-4"
      >
        {{ config.eyebrow }}
      </UBadge>
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
        {{ config.title }}
      </h1>
      <p
        v-if="config.subtitle"
        class="text-xl md:text-2xl mb-4 text-muted"
      >
        {{ config.subtitle }}
      </p>
      <p
        v-if="config.description"
        class="text-lg mb-8 text-muted max-w-2xl mx-auto"
      >
        {{ config.description }}
      </p>
      <div
        v-if="config.actions.length > 0"
        class="flex flex-wrap gap-4 justify-center"
      >
        <UButton
          v-for="(action, index) in config.actions"
          :key="index"
          :to="action.to"
          :target="action.target || '_self'"
          :color="action.color || 'primary'"
          :variant="action.variant || 'solid'"
          :size="action.size || 'lg'"
          :icon="action.icon"
        >
          {{ action.label }}
        </UButton>
      </div>
    </div>
  </div>
</template>
