<script lang="ts" setup>
import type { ComputedRef, DefineComponent } from 'vue'
import { computed, useSlots } from 'vue'
import { LazyMotion, domAnimation, motion } from 'motion-v'
import type { SectionBase } from '#shared/types/sections'
import { getMotionPreset, motionPresets } from '~/utils/motion'

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
    default: 'center'
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
const LazyMotionWrapper = LazyMotion as unknown as DefineComponent<Record<string, unknown>>
const MotionSection = motion.div as unknown as DefineComponent<Record<string, unknown>>
const prefersReducedMotion = usePreferredReducedMotion()
const reduceMotion = computed(() => prefersReducedMotion.value === 'reduce')
const sectionMotion = computed(() => getMotionPreset(motionPresets.sectionEnter, reduceMotion.value))
const slots = useSlots()
const featuresProp = computed(() => (slots.features ? undefined : props.features))
const hasBodySlot = computed(() => Boolean(slots.body))
const hasFeaturesSlot = computed(() => Boolean(slots.features))

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
  default: 'container max-w-6xl mx-auto px-4 md:px-6',
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
  const baseRoot = [
    sectionSpacingClass.value,
    sectionThemeClass.value,
    sectionBackgroundClass.value,
    'min-h-0 h-auto'
  ]
    .filter(Boolean)
    .join(' ')

  const baseContainer = [
    sectionContainerClass.value,
    'min-h-0 !py-8 sm:!py-12 lg:!py-16'
  ].filter(Boolean).join(' ')
  const baseHeader = sectionAlignClass.value

  return {
    root: [baseRoot, props.ui?.root].filter(Boolean).join(' '),
    container: [baseContainer, props.ui?.container].filter(Boolean).join(' '),
    wrapper: props.ui?.wrapper,
    header: [baseHeader, props.ui?.header].filter(Boolean).join(' '),
    leading: props.ui?.leading,
    leadingIcon: props.ui?.leadingIcon,
    headline: [
      'text-xs md:text-sm uppercase tracking-[0.25em] text-primary',
      props.ui?.headline
    ].filter(Boolean).join(' '),
    title: [
      'text-2xl md:text-3xl font-semibold tracking-tight',
      props.ui?.title
    ].filter(Boolean).join(' '),
    description: [
      'text-sm md:text-base text-gray-500 dark:text-gray-400',
      props.ui?.description
    ].filter(Boolean).join(' '),
    body: props.ui?.body,
    items: props.ui?.items,
    item: props.ui?.item,
    footer: props.ui?.footer,
    links: props.ui?.links
  }
})
</script>

<template>
  <LazyMotionWrapper :features="domAnimation">
    <MotionSection
      v-if="enabled"
      :initial="sectionMotion.initial"
      :while-in-view="sectionMotion.animate"
      :viewport="{ once: true, amount: 0.25 }"
    >
      <UPageSection
        :id="id"
        :ref="sectionRef"
        :as="as"
        :headline="headline"
        :icon="icon"
        :title="title"
        :description="description"
        :links="links"
        :features="featuresProp"
        :reverse="reverse ?? false"
        :ui="ui"
      >
        <template
          v-if="slots.top"
          #top
        >
          <slot name="top" />
        </template>

        <template
          v-if="slots.header"
          #header="slotProps"
        >
          <slot
            name="header"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="slots.leading"
          #leading="slotProps"
        >
          <slot
            name="leading"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="slots.headline"
          #headline="slotProps"
        >
          <slot
            name="headline"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="slots.title"
          #title="slotProps"
        >
          <slot
            name="title"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="slots.description"
          #description="slotProps"
        >
          <slot
            name="description"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="hasBodySlot || hasFeaturesSlot"
          #body="slotProps"
        >
          <slot
            v-if="slots.body"
            name="body"
            v-bind="slotProps"
          />
          <slot
            v-if="slots.features"
            name="features"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="slots.footer"
          #footer="slotProps"
        >
          <slot
            name="footer"
            v-bind="slotProps"
          />
        </template>

        <template
          v-if="slots.links"
          #links="slotProps"
        >
          <slot
            name="links"
            v-bind="slotProps"
          />
        </template>

        <slot />

        <template
          v-if="slots.bottom"
          #bottom
        >
          <slot name="bottom" />
        </template>
      </UPageSection>
    </MotionSection>
  </LazyMotionWrapper>
</template>
