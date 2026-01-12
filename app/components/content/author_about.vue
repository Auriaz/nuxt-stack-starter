<script lang="ts" setup>
defineProps<{
  src: string
  name: string
}>()
</script>

<template>
  <u-card
    id="author-about"
    variant="soft"
    class="mt-16"
  >
    <template #header>
      <div class="flex flex-col gap-2">
        <p class="text-highlight font-bold">
          O autorze
        </p>
        <slot name="body" />
      </div>
    </template>

    <template #footer>
      <div class="flex flex-col gap-2">
        <u-avatar :src="src" />
        <p class="type-label">
          {{ name }}
        </p>
        <div class="ml-auto flex items-center justify-end gap-2">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </u-card>
</template>

<style scoped>
  /* @reference '~/assets/css/main.css'; */
</style>
