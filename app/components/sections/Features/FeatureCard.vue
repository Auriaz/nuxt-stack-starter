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
  const base = 'h-full transition-all duration-300'

  if (props.variant === 'minimal') {
    return `${base} p-0`
  }

  if (props.variant === 'cards') {
    return `${base} hover:shadow-xl hover:-translate-y-1 ring-1 ring-border/50 hover:ring-primary/20`
  }

  return `${base}`
})

// Computed dla klas ikony
const iconClasses = computed(() => {
  if (props.variant === 'minimal') {
    return 'p-2 sm:p-3 rounded-lg sm:rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110'
  }
  return 'p-3 sm:p-4 rounded-lg sm:rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 ring-1 ring-primary/20'
})
</script>

<template>
  <UCard
    :variant="cardVariant"
    :class="cardClasses"
  >
    <!-- Grid Layout -->
    <template v-if="layout === 'grid'">
      <div class="flex items-start gap-3 sm:gap-4 mb-4 group">
        <div
          v-if="showIcon && feature.icon"
          :class="iconClasses"
        >
          <UIcon
            :name="feature.icon"
            class="w-5 h-5 sm:w-6 sm:h-6"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
            <h3 class="text-lg sm:text-xl md:text-2xl font-semibold leading-tight">
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
            class="text-sm sm:text-base text-muted leading-relaxed"
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
