<script setup lang="ts">
import type { SectionCTA, SectionBase } from '#shared/types/sections'
import { defineWebPage } from 'nuxt-schema-org/schema'

interface Props {
  section: SectionCTA
  base: SectionBase
  props: SectionCTA['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  actions: props.props?.actions || [],
  highlight: props.props?.highlight,
  note: props.props?.note,
  variant: props.props?.variant || 'default',
  align: props.base.align || 'center'
}))

const containerClasses = computed(() => {
  if (config.value.variant === 'centered' || config.value.variant === 'banner') {
    return 'text-center items-center max-w-2xl mx-auto'
  }
  return 'lg:flex-row lg:items-center lg:justify-between'
})

// Schema.org
const ctaSchema = computed(() => {
  if (!props.base?.schema?.enabled) return null
  return defineWebPage({
    name: config.value.title,
    description: config.value.description
  })
})

if (ctaSchema.value) {
  useSchemaOrg([ctaSchema.value])
}
</script>

<template>
  <div>
    <div
      :class="[
        'flex flex-col gap-6',
        containerClasses
      ]"
    >
      <div class="flex-1">
        <h2
          :class="[
            'text-2xl md:text-3xl font-bold mb-3',
            config.variant === 'banner' ? 'text-primary-foreground' : ''
          ]"
        >
          {{ config.title }}
        </h2>
        <p
          :class="[
            'text-lg mb-4',
            config.variant === 'banner' ? 'text-primary-foreground/90' : 'text-muted'
          ]"
        >
          {{ config.description }}
        </p>
        <p
          v-if="config.highlight"
          class="text-sm font-semibold text-primary mb-4"
        >
          {{ config.highlight }}
        </p>
      </div>

      <div
        :class="[
          'flex flex-col sm:flex-row gap-4',
          config.variant === 'centered' || config.variant === 'banner'
            ? 'justify-center'
            : 'shrink-0'
        ]"
      >
        <UButton
          v-for="(action, index) in config.actions"
          :key="index"
          :to="action.to"
          :target="action.target || '_self'"
          :color="config.variant === 'banner' ? 'white' : action.color || 'primary'"
          :variant="action.variant || 'solid'"
          :size="action.size || 'lg'"
          :icon="action.icon"
        >
          {{ action.label }}
        </UButton>
      </div>

      <p
        v-if="config.note"
        class="text-sm text-muted text-center"
      >
        {{ config.note }}
      </p>
    </div>
  </div>
</template>
