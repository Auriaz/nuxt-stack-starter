<script lang="ts" setup>
export interface Action {
  label: string
  icon?: string
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral'
  variant?: 'solid' | 'outline' | 'ghost'
  onClick: () => void
}

defineProps<{
  actions: Action[]
}>()
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      v-for="(action, index) in actions"
      :key="index"
      :icon="action.icon"
      :color="action.color || 'primary'"
      :variant="action.variant || 'solid'"
      @click="action.onClick"
    >
      {{ action.label }}
    </UButton>
  </div>
</template>
