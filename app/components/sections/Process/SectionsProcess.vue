<script setup lang="ts">
import type { SectionProcess, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionProcess
  base: SectionBase
  props: SectionProcess['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  steps: props.props?.steps || [],
  layout: props.props?.layout || 'horizontal',
  variant: props.props?.variant || 'default',
  align: props.base.align || 'center'
}))

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))
</script>

<template>
  <div>
    <div
      v-if="config.title || config.description"
      :class="['mb-12', headerClasses]"
    >
      <h2
        v-if="config.title"
        class="text-3xl md:text-4xl font-bold mb-4"
      >
        {{ config.title }}
      </h2>
      <p
        v-if="config.description"
        class="text-lg text-muted max-w-2xl mx-auto"
      >
        {{ config.description }}
      </p>
    </div>

    <!-- Horizontal Layout -->
    <div
      v-if="config.layout === 'horizontal'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
    >
      <div
        v-for="(step, index) in config.steps"
        :key="index"
        class="text-center"
      >
        <div
          v-if="step.number"
          class="mb-4 text-4xl font-bold text-primary"
        >
          {{ step.number }}
        </div>
        <div
          v-else-if="step.icon"
          class="mb-4 flex justify-center"
        >
          <div class="p-4 rounded-lg bg-primary/10 text-primary">
            <UIcon
              :name="step.icon"
              class="w-8 h-8"
            />
          </div>
        </div>
        <h3 class="text-xl font-semibold mb-2">
          {{ step.title }}
        </h3>
        <p
          v-if="step.description"
          class="text-muted"
        >
          {{ step.description }}
        </p>
      </div>
    </div>

    <!-- Vertical Layout -->
    <div
      v-else-if="config.layout === 'vertical'"
      class="space-y-8"
    >
      <div
        v-for="(step, index) in config.steps"
        :key="index"
        class="flex gap-6"
      >
        <div class="shrink-0">
          <div
            v-if="step.number"
            class="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold"
          >
            {{ step.number }}
          </div>
          <div
            v-else-if="step.icon"
            class="p-3 rounded-lg bg-primary/10 text-primary"
          >
            <UIcon
              :name="step.icon"
              class="w-6 h-6"
            />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-semibold mb-2">
            {{ step.title }}
          </h3>
          <p
            v-if="step.description"
            class="text-muted"
          >
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Timeline Layout -->
    <div
      v-else
      class="relative"
    >
      <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
      <div class="space-y-8">
        <div
          v-for="(step, index) in config.steps"
          :key="index"
          class="relative pl-20"
        >
          <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
            {{ step.number || index + 1 }}
          </div>
          <h3 class="text-xl font-semibold mb-2">
            {{ step.title }}
          </h3>
          <p
            v-if="step.description"
            class="text-muted"
          >
            {{ step.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
