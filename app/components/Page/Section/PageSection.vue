<script lang="ts" setup>
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import type { SectionBase } from '#shared/types/sections'

const props = defineProps({
  type: {
    type: String as PropType<SectionBase['type']>,
    required: true
  },
  enabled: {
    type: Boolean,
    default: true
  },
  spacing: {
    type: String as PropType<SectionBase['spacing']>,
    default: 'md'
  },
  theme: {
    type: String as PropType<SectionBase['theme']>,
    default: 'light'
  },
  background: {
    type: String as PropType<SectionBase['background']>,
    default: 'none'
  },
  container: {
    type: String as PropType<SectionBase['container']>,
    default: 'default'
  },
  align: {
    type: String as PropType<SectionBase['align']>,
    default: 'left'
  },
  ui: {
    type: Object as PropType<SectionBase['ui']>,
    default: () => ({})
  },
  id: {
    type: String,
    default: ''
  },
  sectionRef: {
    type: String,
    default: ''
  },
  as: {
    type: String as PropType<SectionBase['as']>,
    default: 'section'
  },
  headline: {
    type: String as PropType<SectionBase['headline']>,
    default: ''
  },
  icon: {
    type: String as PropType<SectionBase['icon']>,
    default: ''
  },
  title: {
    type: String as PropType<SectionBase['title']>,
    default: ''
  },
  description: {
    type: String as PropType<SectionBase['description']>,
    default: ''
  },
  links: {
    type: Array as PropType<SectionBase['links']>,
    default: () => []
  },
  features: {
    type: Array as PropType<SectionBase['features']>,
    default: () => []
  },
  reverse: {
    type: Boolean,
    default: false
  }
})

const enabled = computed(() => props.enabled !== false)

const spacingClasses: Record<NonNullable<SectionBase['spacing']>, string> = {
  'none': '',
  'xs': 'py-4',
  'sm': 'py-6',
  'md': 'py-8',
  'lg': 'py-12',
  'xl': 'py-16',
  '2xl': 'py-20'
}

const themeClasses: Record<NonNullable<SectionBase['theme']>, string> = {
  light: '',
  dark: 'bg-gray-900 text-white',
  brand: 'bg-primary-50 dark:bg-primary-950',
  neutral: 'bg-gray-50 dark:bg-gray-900'
}

const backgroundClasses: Record<NonNullable<SectionBase['background']>, string> = {
  none: 'h-auto',
  subtle: 'bg-gray-50/50 dark:bg-gray-900/50',
  muted: 'bg-gray-100 dark:bg-gray-800',
  surface: 'bg-white dark:bg-gray-950',
  gradient: 'bg-gradient-to-b from-primary-50/60 to-background dark:from-primary-950/60 dark:to-background',
  image: ''
}

const containerClasses: Record<NonNullable<SectionBase['container']>, string> = {
  default: '',
  narrow: 'container max-w-3xl mx-auto px-4 md:px-6',
  wide: 'container max-w-7xl mx-auto px-4 md:px-6',
  full: 'w-full px-4 md:px-6'
}

const alignClasses: Record<NonNullable<SectionBase['align']>, string> = {
  none: '',
  left: 'text-left items-start',
  center: 'text-center items-center justify-center'
}

const sectionSpacingClass: ComputedRef<string> = computed(() => {
  const spacing = props.spacing ?? 'none'
  return spacingClasses[spacing]
})

const sectionThemeClass: ComputedRef<string> = computed(() => {
  const theme = props.theme ?? 'light'
  return themeClasses[theme]
})

const sectionBackgroundClass: ComputedRef<string> = computed(() => {
  const background = props.background ?? 'none'
  return backgroundClasses[background]
})

const sectionContainerClass: ComputedRef<string> = computed(() => {
  const container = props.container ?? 'default'
  return containerClasses[container]
})

const sectionAlignClass: ComputedRef<string> = computed(() => {
  const align = props.align ?? 'none'
  return alignClasses[align]
})

const ui = computed(() => {
  const baseRoot = [sectionSpacingClass.value, sectionThemeClass.value, sectionBackgroundClass.value]
    .filter(Boolean)
    .join(' ')

  const baseContainer = sectionContainerClass.value
  const baseHeader = sectionAlignClass.value

  return {
    root: [baseRoot, props.ui?.root].filter(Boolean).join(' '),
    container: [baseContainer, props.ui?.container].filter(Boolean).join(' '),
    wrapper: props.ui?.wrapper,
    header: [baseHeader, props.ui?.header].filter(Boolean).join(' '),
    leading: props.ui?.leading,
    leadingIcon: props.ui?.leadingIcon,
    headline: ['text-center text-primary-600 dark:text-primary-500', props.ui?.headline].filter(Boolean).join(' '),
    title: props.ui?.title,
    description: props.ui?.description,
    body: props.ui?.body,
    items: props.ui?.items,
    item: props.ui?.item,
    footer: props.ui?.footer,
    links: props.ui?.links
  }
})
</script>

<template>
  <UPageSection
    v-if="enabled"
    :id="id"
    :ref="sectionRef"
    :as="as"
    :headline="headline"
    :icon="icon"
    :title="title"
    :description="description"
    :links="links"
    :features="features"
    :reverse="reverse ?? false"
    :ui="ui"
  >
    <template #top>
      <slot name="top" />
    </template>

    <template #header="slotProps">
      <slot
        name="header"
        v-bind="slotProps"
      />
    </template>

    <template #leading="slotProps">
      <slot
        name="leading"
        v-bind="slotProps"
      />
    </template>

    <template #headline="slotProps">
      <slot
        name="headline"
        v-bind="slotProps"
      />
    </template>

    <template #title="slotProps">
      <slot
        name="title"
        v-bind="slotProps"
      />
    </template>

    <template #description="slotProps">
      <slot
        name="description"
        v-bind="slotProps"
      />
    </template>

    <template #body="slotProps">
      <slot
        name="body"
        v-bind="slotProps"
      />
    </template>

    <template #features="slotProps">
      <slot
        name="features"
        v-bind="slotProps"
      />
    </template>

    <template #footer="slotProps">
      <slot
        name="footer"
        v-bind="slotProps"
      />
    </template>

    <template #links="slotProps">
      <slot
        name="links"
        v-bind="slotProps"
      />
    </template>

    <slot />

    <template #bottom>
      <slot name="bottom" />
    </template>
  </UPageSection>
</template>
