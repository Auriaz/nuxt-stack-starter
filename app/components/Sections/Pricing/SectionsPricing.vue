<script setup lang="ts">
import type { SectionPricing } from '#shared/types/sections'
import type { PricingPlanProps } from '@nuxt/ui'
import PageSection from '~/components/Page/Section/PageSection.vue'

const props = defineProps<{
  section: SectionPricing
}>()

// const config = computed(() => ({
//   id: props.section.id,
//   ref: props.section.ref,
//   headline: props.section.headline,
//   icon: props.section.icon,
//   title: props.section.title,
//   description: props.section.description,
//   links: props.section.links || [],
//   orientation: props.section.orientation || 'vertical',
//   reverse: props.section.reverse || false,
//   ui: props.section.ui || {}
// }))

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
      variant: plan.variant,
      highlight: plan.highlight,
      scale: plan.scale,
      ui: plan.ui
    }

    if (plan.features) {
      const allStrings = plan.features.every(f => typeof f === 'string')
      const allObjects = plan.features.every(f => typeof f === 'object')

      if (allStrings) {
        pricingPlan.features = plan.features as string[]
      } else if (allObjects) {
        pricingPlan.features = plan.features as Array<{ title: string, icon?: unknown }>
      } else {
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
  <PageSection
    :id="section.id"
    :type="section.type"
    :section-ref="section.ref"
    :headline="section.headline"
    :icon="section.icon"
    :title="section.title"
    :description="section.description"
    :reverse="section.reverse"
    :ui="section.ui"
  >
    <UPageGrid v-if="plans.length > 0">
      <UPricingPlan
        v-for="(plan, index) in plans"
        :key="index"
        v-bind="plan"
      />
    </UPageGrid>
  </PageSection>
</template>
