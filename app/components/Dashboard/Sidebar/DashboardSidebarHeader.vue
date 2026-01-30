<script lang="ts" setup>
defineProps<{
  collapsed: boolean
}>()
</script>

<template>
  <div class="flex items-center justify-center w-full p-2">
    <div
      v-if="!collapsed"
      class="w-20 h-20 translate-y-2.5"
    >
      <Logo />
    </div>

    <UIcon
      v-else
      name="i-lucide-layout-dashboard"
      class="size-6 text-primary mx-auto"
    />
  </div>
</template>
