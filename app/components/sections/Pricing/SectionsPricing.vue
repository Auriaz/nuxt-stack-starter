<script setup lang="ts">
import type { SectionPricing, SectionBase } from '#shared/types/sections'

interface Props {
  section: SectionPricing
  base: SectionBase
  props: SectionPricing['props']
}

const props = defineProps<Props>()

// Computed config łączący base i props
const config = computed(() => {
  const align = props.base.align || 'center'
  const layout = props.props?.layout || 'grid'

  return {
    title: props.base.title,
    description: props.base.description,
    plans: props.props?.plans || [],
    layout,
    align
  }
})

// Computed dla klas header
const headerClasses = computed(() => {
  return {
    'text-center': config.value.align === 'center',
    'text-left': config.value.align === 'left'
  }
})
</script>

<template>
  <div>
    <!-- Header -->
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

    <!-- Plans Grid -->
    <div
      v-if="config.layout === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      <UCard
        v-for="(plan, index) in config.plans"
        :key="index"
        :class="['relative h-full', plan.popular ? 'border-2 border-primary shadow-lg' : '']"
      >
        <template
          v-if="plan.popular"
          #header
        >
          <div class="absolute -top-4 left-1/2 -translate-x-1/2">
            <UBadge
              color="primary"
              variant="solid"
              size="lg"
            >
              Najpopularniejszy
            </UBadge>
          </div>
        </template>

        <div class="text-center mb-6">
          <h3 class="text-2xl font-bold mb-2">
            {{ plan.name }}
          </h3>
          <p
            v-if="plan.description"
            class="text-sm text-muted mb-4"
          >
            {{ plan.description }}
          </p>
          <div class="flex items-baseline justify-center gap-2">
            <span class="text-4xl font-bold">
              {{ plan.price }}
            </span>
            <span
              v-if="plan.period"
              class="text-muted"
            >
              {{ plan.period }}
            </span>
          </div>
        </div>

        <ul class="space-y-3 mb-6">
          <li
            v-for="(feature, featureIndex) in plan.features"
            :key="featureIndex"
            class="flex items-start gap-2"
          >
            <UIcon
              name="i-lucide-check"
              class="w-5 h-5 text-primary shrink-0 mt-0.5"
            />
            <span class="text-sm">{{ feature }}</span>
          </li>
        </ul>

        <UButton
          :to="plan.action.to"
          :color="plan.action.color || (plan.popular ? 'primary' : 'neutral')"
          :variant="plan.action.variant || (plan.popular ? 'solid' : 'outline')"
          :size="plan.action.size || 'lg'"
          :target="plan.action.target"
          block
        >
          {{ plan.action.label }}
        </UButton>
      </UCard>
    </div>

    <!-- Plans Table (placeholder - można rozszerzyć w przyszłości) -->
    <div
      v-else-if="config.layout === 'table'"
      class="overflow-x-auto"
    >
      <table class="w-full">
        <thead>
          <tr>
            <th class="text-left p-4">
              Plan
            </th>
            <th
              v-for="(plan, index) in config.plans"
              :key="index"
              class="text-center p-4"
            >
              {{ plan.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="p-4 font-semibold">
              Cena
            </td>
            <td
              v-for="(plan, index) in config.plans"
              :key="index"
              class="text-center p-4"
            >
              <div class="flex items-baseline justify-center gap-2">
                <span class="text-2xl font-bold">{{ plan.price }}</span>
                <span
                  v-if="plan.period"
                  class="text-muted"
                >{{ plan.period }}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td class="p-4 font-semibold">
              Funkcje
            </td>
            <td
              v-for="(plan, index) in config.plans"
              :key="index"
              class="p-4"
            >
              <ul class="space-y-2">
                <li
                  v-for="(feature, fIndex) in plan.features"
                  :key="fIndex"
                  class="flex items-start gap-2 text-sm"
                >
                  <UIcon
                    name="i-lucide-check"
                    class="w-4 h-4 text-primary shrink-0 mt-0.5"
                  />
                  <span>{{ feature }}</span>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
