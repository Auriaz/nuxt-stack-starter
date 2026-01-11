<template>
  <div class="flex items-start gap-3">
    <div class="flex items-center justify-center border rounded-lg p-1.5">
      <UIcon :name="icon" />
    </div>
    <div class="flex flex-col">
      <h3 class="font-semibold">
        <slot name="title" />
      </h3>
      <span>
        <slot name="description" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps({
    icon: {
      type: String,
      default: 'i-lucide-cursor-click',
    },
  })
</script>
