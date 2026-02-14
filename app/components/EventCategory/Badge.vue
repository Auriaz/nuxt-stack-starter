<script lang="ts" setup>
import type { EventCategoryDTO } from '#shared/types/event-category'

const props = withDefaults(
  defineProps<{
    category: Partial<EventCategoryDTO> | null
    size?: 'xs' | 'sm' | 'md' | 'lg'
    showIcon?: boolean
  }>(),
  {
    size: 'sm',
    showIcon: true
  }
)

const badgeStyle = computed(() => {
  if (!props.category?.color) return {}

  return {
    '--category-color': props.category.color,
    'borderColor': props.category.color,
    'color': props.category.color
  }
})

const sizeClass = computed(() => {
  const sizes = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-1.5',
    lg: 'text-lg px-4 py-2'
  }
  return sizes[props.size]
})
</script>

<template>
  <div
    v-if="category"
    class="inline-flex items-center gap-1.5 rounded-md border bg-white/50 dark:bg-gray-900/50 font-medium"
    :class="sizeClass"
    :style="badgeStyle"
  >
    <UIcon
      v-if="showIcon && category.icon"
      :name="category.icon"
      class="flex-shrink-0"
    />
    <span>{{ category.label }}</span>
  </div>
</template>

<style scoped>
div {
  border-left-width: 3px;
  border-left-color: var(--category-color, #3b82f6);
}
</style>
