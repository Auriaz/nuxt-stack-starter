<script setup lang="ts">
import { safeParse } from 'valibot'
import type { Section, SectionBase } from '#shared/types/sections'
import { SectionSchema } from '#shared/schemas/sections'

interface Props {
  sections?: Section[]
}

const props = defineProps<Props>()

// Walidacja i filtrowanie sekcji
const validatedSections = computed(() => {
  if (!props.sections) return []

  return props.sections
    .filter(section => section.enabled !== false)
    .map((section) => {
      const result = safeParse(SectionSchema, section)
      if (!result.success) {
        // eslint-disable-next-line no-console
        console.warn('Invalid section:', result.issues, section)
        return null
      }
      return result.output
    })
    .filter(Boolean) as Section[]
})

// Computed dla klas kontenera
const getContainerClasses = (section: Section) => {
  const container = section.container || 'default'
  const classes: Record<string, string> = {
    default: 'container mx-auto px-4 sm:px-6 lg:px-8',
    wide: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl',
    full: 'w-full'
  }
  return classes[container] || classes.default
}

// Computed dla klas spacing
const getSpacingClasses = (section: Section) => {
  const spacing = section.spacing || 'md'
  const classes: Record<string, string> = {
    sm: 'py-12 sm:py-16 md:py-20',
    md: 'py-16 sm:py-20 md:py-24 lg:py-28',
    lg: 'py-20 sm:py-24 md:py-32 lg:py-40',
    none: 'py-0'
  }
  return classes[spacing] || classes.md
}

// Computed dla klas theme
const getThemeClasses = (section: Section) => {
  const theme = section.theme || 'light'
  const classes: Record<string, string> = {
    light: 'bg-elevated/10 mb-20 rounded-2xl shadow-lg shadow-black/20 hover:shadow-primary-900/20 hover:shadow-xl transition-all duration-300',
    dark: 'bg-elevated/10 text-white rounded-2xl mb-20 shadow-lg shadow-primary-900 hover:shadow-md transition-all duration-300',
    brand: 'bg-elevated/10 mb-20'
  }
  return classes[theme] || classes.light
}

// Computed dla background style
const getBackgroundStyle = (section: Section) => {
  if (!section.background || section.background.type === 'none') return null

  if (section.background.type === 'gradient' && section.background.gradient) {
    return {
      background: section.background.gradient
    }
  }

  if (section.background.type === 'image' && section.background.image) {
    return {
      backgroundImage: `url(${section.background.image.src})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
  }

  return null
}

// Helper do wyodrębnienia base z section
const getSectionBase = (section: Section): SectionBase => {
  return {
    type: section.type,
    id: section.id,
    enabled: section.enabled,
    title: section.title,
    subtitle: section.subtitle,
    eyebrow: section.eyebrow,
    description: section.description,
    align: section.align,
    theme: section.theme,
    container: section.container,
    spacing: section.spacing,
    background: section.background,
    seo: section.seo,
    schema: section.schema
  }
}
</script>

<template>
  <div class="sections-renderer">
    <section
      v-for="(section, index) in validatedSections"
      :id="section.id || undefined"
      :key="section.id || `section-${section.type}-${index}`"
      :class="[
        getContainerClasses(section),
        getSpacingClasses(section),
        getThemeClasses(section),
        'relative'
      ]"
      :style="getBackgroundStyle(section)"
    >
      <!-- Background overlay dla image background -->
      <div
        v-if="section.background?.type === 'image' && section.background.overlay"
        class="absolute inset-0 bg-black/50 z-0"
      />

      <!-- Content wrapper -->
      <div
        :class="[
          'relative z-10',
          section.background?.type === 'image' && section.background.overlay ? 'text-white' : ''
        ]"
      >
        <!-- Hero Section -->
        <SectionsHero
          v-if="section.type === 'hero'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Social Proof Section -->
        <SectionsSocialProof
          v-else-if="section.type === 'social-proof'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Features Section -->
        <SectionsFeatures
          v-else-if="section.type === 'features'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Process Section -->
        <SectionsProcess
          v-else-if="section.type === 'process'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Portfolio Section -->
        <SectionsPortfolio
          v-else-if="section.type === 'portfolio'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- FAQ Section -->
        <SectionsFAQ
          v-else-if="section.type === 'faq'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- CTA Section -->
        <SectionsCTA
          v-else-if="section.type === 'cta'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        >
          <slot />
        </SectionsCTA>

        <!-- Pricing Section -->
        <SectionsPricing
          v-else-if="section.type === 'pricing'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Contact Details Section -->
        <SectionsContactDetails
          v-else-if="section.type === 'contact-details'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Contact Form Section -->
        <SectionsContactForm
          v-else-if="section.type === 'contact-form'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />

        <!-- Map Section -->
        <SectionsMap
          v-else-if="section.type === 'map'"
          :section="section"
          :base="getSectionBase(section)"
          :props="section.props"
        />
      </div>
    </section>
  </div>
</template>
