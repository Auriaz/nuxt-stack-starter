<script lang="ts" setup>
defineProps<{
  label: string
  value: number | string
  icon?: string
  loading?: boolean
}>()
</script>

<template>
  <UCard class="glass-panel cockpit-panel relative overflow-hidden">
    <div class="cockpit-hud-corners" />
    <div class="flex items-start justify-between gap-2">
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-muted">
          {{ label }}
        </p>
        <div
          v-if="loading"
          class="mt-2 h-8 w-20 animate-pulse rounded bg-default-200"
        />
        <p
          v-else
          class="mt-1 text-2xl font-semibold tabular-nums"
        >
          {{ typeof value === 'number' ? value.toLocaleString('pl-PL') : value }}
        </p>
      </div>
      <div
        v-if="icon"
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400"
      >
        <UIcon
          :name="icon"
          class="size-5"
        />
      </div>
    </div>
  </UCard>
</template>
