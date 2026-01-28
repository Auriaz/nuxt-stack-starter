<script setup lang="ts">
const props = defineProps<{
  title: string
  description?: string
  updatedAt?: string
  page: Record<string, unknown>
}>()
</script>

<template>
  <UPage :ui="{ root: 'container mx-auto px-4 md:px-0 py-12 md:py-16' }">
    <UPageBody class="max-w-3xl mx-auto space-y-8">
      <header class="space-y-3">
        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
          {{ props.title }}
        </h1>
        <p
          v-if="props.description"
          class="text-sm md:text-base text-gray-500 dark:text-gray-400"
        >
          {{ props.description }}
        </p>
        <p
          v-if="props.updatedAt"
          class="text-xs text-gray-400 dark:text-gray-500"
        >
          Ostatnia aktualizacja: {{ props.updatedAt }}
        </p>
      </header>

      <div class="prose prose-sm md:prose-base prose-slate dark:prose-invert max-w-none">
        <ContentRenderer :value="props.page" />
      </div>
    </UPageBody>
  </UPage>
</template>
