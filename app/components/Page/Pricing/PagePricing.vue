<script lang="ts" setup>
import type { SectionPricing } from '#shared/types/sections'
import type { PricingPlanProps } from '@nuxt/ui'

const props = defineProps({
  section: {
    type: Object as PropType<SectionPricing>,
    required: true
  }
})

const config = computed(() => ({
  type: props.section.type || 'pricing',
  id: props.section.id || '',
  ref: props.section.ref || '',
  enabled: props.section.enabled !== false,
  headline: props.section.headline || '',
  icon: props.section.icon || '',
  title: props.section.title || '',
  description: props.section.description || '',
  links: props.section.links || [],
  orientation: props.section.orientation || 'vertical',
  reverse: props.section.reverse || false,
  ui: props.section.ui || {}
}))

const plans = computed(() => {
  return (props.section.plans || []).map((plan) => {
    const pricingPlan: Record<string, unknown> = {
      as: plan.as,
      title: plan.title,
      description: plan.description,
      badge: plan.badge,
      billingCycle: plan.billingCycle,
      billingPeriod: plan.billingPeriod,
      price: plan.price,
      discount: plan.discount,
      button: plan.button,
      tagline: plan.tagline,
      terms: plan.terms,
      orientation: plan.orientation,
      variant: plan.variant,
      highlight: plan.highlight,
      scale: plan.scale,
      ui: plan.ui
    }

    // Konwersja features do odpowiedniego typu
    if (plan.features) {
      const allStrings = plan.features.every(f => typeof f === 'string')
      const allObjects = plan.features.every(f => typeof f === 'object')

      if (allStrings) {
        pricingPlan.features = plan.features as string[]
      } else if (allObjects) {
        pricingPlan.features = plan.features as Array<{ title: string, icon?: unknown }>
      } else {
        // Jeśli są mieszane, konwertuj wszystko na stringi
        pricingPlan.features = plan.features.map((f) => {
          return typeof f === 'string' ? f : f.title
        })
      }
    }

    return pricingPlan as PricingPlanProps
  })
})
</script>

<template>
  <div>
    <UPageSection
      v-if="config.enabled"
      :id="config.id"
      :ref="config.ref"
      :headline="config.headline"
      :icon="config.icon"
      :title="config.title"
      :description="config.description"
      :links="config.links"
      :orientation="config.orientation"
      :reverse="config.reverse"
      :ui="config.ui"
    >
      <UPageGrid
        v-if="plans.length > 0"
      >
        <UPricingPlan
          v-for="(plan, index) in plans"
          :key="index"
          v-bind="plan"
        />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
