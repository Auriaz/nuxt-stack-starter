<script setup lang="ts">
import type { SectionContactDetails, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionContactDetails
  base: SectionBase
  props: SectionContactDetails['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  variant: props.props?.variant || 'cards',
  items: props.props?.items || [],
  align: props.base.align || 'center'
}))

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))

const gridClasses = computed(() => {
  if (config.value.variant === 'list') {
    return 'space-y-4'
  }
  return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
})
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
        class="text-lg text-muted max-w-2xl"
        :class="config.align === 'center' ? 'mx-auto' : ''"
      >
        {{ config.description }}
      </p>
    </div>

    <!-- Cards Variant -->
    <div
      v-if="config.variant === 'cards'"
      :class="gridClasses"
    >
      <UCard
        v-for="(item, index) in config.items"
        :key="index"
        class="h-full"
      >
        <div class="flex items-start gap-4">
          <div
            v-if="item.icon"
            class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0"
          >
            <UIcon
              :name="item.icon"
              class="w-6 h-6"
            />
          </div>
          <div class="flex-1">
            <h3 class="font-semibold mb-1">
              {{ item.label }}
            </h3>
            <div
              v-if="item.href"
              class="text-muted hover:text-primary transition-colors"
            >
              <a
                :href="item.href"
                :target="item.href.startsWith('http') ? '_blank' : '_self'"
                :rel="item.href.startsWith('http') ? 'noopener noreferrer' : undefined"
              >
                <span class="whitespace-pre-line">{{ item.value }}</span>
              </a>
            </div>
            <p
              v-else
              class="text-muted whitespace-pre-line"
            >
              {{ item.value }}
            </p>
            <p
              v-if="item.note"
              class="text-sm text-muted mt-2"
            >
              {{ item.note }}
            </p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- List Variant -->
    <div
      v-else
      :class="gridClasses"
    >
      <div
        v-for="(item, index) in config.items"
        :key="index"
        class="flex items-start gap-4"
      >
        <div
          v-if="item.icon"
          class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0"
        >
          <UIcon
            :name="item.icon"
            class="w-6 h-6"
          />
        </div>
        <div class="flex-1">
          <h3 class="font-semibold mb-1">
            {{ item.label }}
          </h3>
          <div
            v-if="item.href"
            class="text-muted hover:text-primary transition-colors"
          >
            <a
              :href="item.href"
              :target="item.href.startsWith('http') ? '_blank' : '_self'"
              :rel="item.href.startsWith('http') ? 'noopener noreferrer' : undefined"
            >
              <span class="whitespace-pre-line">{{ item.value }}</span>
            </a>
          </div>
          <p
            v-else
            class="text-muted whitespace-pre-line"
          >
            {{ item.value }}
          </p>
          <p
            v-if="item.note"
            class="text-sm text-muted mt-2"
          >
            {{ item.note }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
