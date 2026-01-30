<script lang="ts" setup>
defineProps<{
  title?: string
  class?: string
}>()
</script>

<template>
  <UPageCard
    variant="ghost"
    :class="['glass-panel cockpit-panel relative overflow-hidden', $props.class]"
  >
    <div class="cockpit-hud-corners" />

    <template
      v-if="title"
      #header
    >
      <h3 class="text-lg font-semibold">
        {{ title }}
      </h3>
    </template>

    <slot />
  </UPageCard>
</template>
