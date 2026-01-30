<script lang="ts" setup>
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <div class="flex items-center gap-3">
    <UIcon
      v-if="icon"
      :name="icon"
      class="w-5 h-5 text-primary"
    />
    <h1 class="text-xl font-semibold">
      {{ title }}
    </h1>
  </div>
</template>
