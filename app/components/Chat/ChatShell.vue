<script lang="ts" setup>
defineProps<{
  stacked?: boolean
}>()
</script>

<template>
  <div
    :class="stacked
      ? 'flex h-full flex-col gap-4'
      : 'grid h-full gap-4 lg:grid-cols-[320px_minmax(0,1fr)]'"
  >
    <div class="min-h-0">
      <slot name="threads" />
    </div>
    <div class="min-h-0">
      <slot name="conversation" />
    </div>
  </div>
</template>
