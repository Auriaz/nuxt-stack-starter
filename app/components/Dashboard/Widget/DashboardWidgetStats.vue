<script lang="ts" setup>
defineProps<{
  title: string
  value: number | string
  icon: string
  change?: number | string
  changeType?: 'increase' | 'decrease'
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}>()

const colorMode = useColorMode()
</script>

<template>
  <UPageCard
    variant="ghost"
    class="glass-panel cockpit-panel relative overflow-hidden"
  >
    <!-- HUD Corner Indicators -->
    <div class="cockpit-hud-corners" />

    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h3
          class="text-sm font-medium"
          :class="{
            'text-slate-600': colorMode.preference === 'light',
            'text-slate-300': colorMode.preference === 'dark' || colorMode.preference === 'system'
          }"
        >
          {{ title }}
        </h3>
        <UIcon
          :name="icon"
          class="w-5 h-5"
          :class="{
            'text-primary': color === 'primary',
            'text-success': color === 'success',
            'text-warning': color === 'warning',
            'text-error': color === 'error',
            'text-info': color === 'info'
          }"
        />
      </div>

      <div class="flex items-baseline gap-2">
        <span
          class="text-3xl font-bold"
          :class="{
            'text-slate-800': colorMode.preference === 'light',
            'text-white': colorMode.preference === 'dark' || colorMode.preference === 'system'
          }"
        >
          {{ value }}
        </span>
        <span
          v-if="change !== undefined"
          class="text-sm flex items-center gap-1"
          :class="{
            'text-success': changeType === 'increase',
            'text-error': changeType === 'decrease'
          }"
        >
          <UIcon
            :name="changeType === 'increase' ? 'i-lucide-arrow-up' : 'i-lucide-arrow-down'"
            class="w-4 h-4"
          />
          {{ change }}
        </span>
      </div>
    </div>
  </UPageCard>
</template>
