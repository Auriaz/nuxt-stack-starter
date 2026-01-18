<script setup lang="ts">
import type { FeatureItem } from '#shared/types/content'

interface Props {
  feature: FeatureItem
  variant?: 'default' | 'cards' | 'minimal'
  layout?: 'grid' | 'list'
  showIcon?: boolean
  showBadge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'cards',
  layout: 'grid',
  showIcon: true,
  showBadge: true
})

// Computed dla wariantu karty
const cardVariant = computed(() => {
  if (props.variant === 'minimal') return 'subtle'
  if (props.variant === 'cards') return 'outline'
  return 'outline'
})

// Computed dla klas karty
const cardClasses = computed(() => {
  const base = 'h-full transition-all'

  if (props.variant === 'minimal') {
    return `${base} p-0`
  }

  if (props.variant === 'cards') {
    return `${base} hover:shadow-lg`
  }

  return `${base}`
})

// Computed dla klas ikony
const iconClasses = computed(() => {
  if (props.variant === 'minimal') {
    return 'p-2 rounded-lg bg-primary/10 text-primary'
  }
  return 'p-3 rounded-lg bg-primary/10 text-primary'
})
</script>

<template>
  <UCard
    :variant="cardVariant"
    :class="cardClasses"
  >
    <!-- Grid Layout -->
    <template v-if="layout === 'grid'">
      <div class="flex items-start gap-4 mb-4">
        <div
          v-if="showIcon && feature.icon"
          :class="iconClasses"
        >
          <UIcon
            :name="feature.icon"
            class="w-6 h-6"
          />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-xl font-semibold">
              {{ feature.title }}
            </h3>
            <UBadge
              v-if="showBadge && feature.badge"
              color="primary"
              variant="soft"
              size="sm"
            >
              {{ feature.badge }}
            </UBadge>
          </div>
          <p
            v-if="feature.description"
            class="text-muted"
          >
            {{ feature.description }}
          </p>
        </div>
      </div>

      <UButton
        v-if="feature.link"
        :to="feature.link.href"
        :target="feature.link.target || '_self'"
        variant="ghost"
        size="sm"
        class="mt-4"
      >
        {{ feature.link.label }}
      </UButton>
    </template>

    <!-- List Layout -->
    <template v-else>
      <div class="flex items-start gap-4">
        <div
          v-if="showIcon && feature.icon"
          :class="iconClasses"
        >
          <UIcon
            :name="feature.icon"
            class="w-6 h-6"
          />
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-xl font-semibold">
              {{ feature.title }}
            </h3>
            <UBadge
              v-if="showBadge && feature.badge"
              color="primary"
              variant="soft"
              size="sm"
            >
              {{ feature.badge }}
            </UBadge>
          </div>
          <p
            v-if="feature.description"
            class="text-muted mb-3"
          >
            {{ feature.description }}
          </p>
          <UButton
            v-if="feature.link"
            :to="feature.link.href"
            :target="feature.link.target || '_self'"
            variant="ghost"
            size="sm"
          >
            {{ feature.link.label }}
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>
