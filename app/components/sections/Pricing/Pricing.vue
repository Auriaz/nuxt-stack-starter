<script setup lang="ts">
  interface PricingPlan {
    name: string
    price: string
    period?: string
    description: string
    features: string[]
    ctaText: string
    ctaTo: string
    popular?: boolean
  }

  interface Props {
    title?: string
    description?: string
    plans?: PricingPlan[]
  }

  const props = withDefaults(defineProps<Props>(), {
    title: 'Cennik',
    description: 'Wybierz plan dopasowany do Twoich potrzeb',
    plans: () => [
      {
        name: 'Podstawowy',
        price: '999',
        period: 'PLN',
        description: 'Idealny dla małych projektów',
        features: [
          'Strona główna + 3 podstrony',
          'Responsywny design',
          'Podstawowe SEO',
          'Formularz kontaktowy',
          'Wsparcie email',
        ],
        ctaText: 'Wybierz plan',
        ctaTo: '/kontakt',
      },
      {
        name: 'Standardowy',
        price: '2499',
        period: 'PLN',
        description: 'Najpopularniejszy wybór',
        popular: true,
        features: [
          'Wszystko z planu Podstawowy',
          'Do 10 podstron',
          'Zaawansowane SEO',
          'Blog',
          'Integracje zewnętrzne',
          'Priorytetowe wsparcie',
        ],
        ctaText: 'Wybierz plan',
        ctaTo: '/kontakt',
      },
      {
        name: 'Premium',
        price: '4999',
        period: 'PLN',
        description: 'Dla wymagających projektów',
        features: [
          'Wszystko z planu Standardowy',
          'Nielimitowane podstrony',
          'E-commerce',
          'Panel administracyjny',
          'Dedykowane wsparcie',
          'Szkolenia',
        ],
        ctaText: 'Wybierz plan',
        ctaTo: '/kontakt',
      },
    ],
  })
</script>

<template>
  <section class="py-20 bg-muted/50">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ props.title }}
        </h2>
        <p class="text-lg text-muted max-w-2xl mx-auto">
          {{ props.description }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <UCard
          v-for="(plan, index) in props.plans"
          :key="index"
          :class="['relative h-full', plan.popular ? 'border-2 border-primary shadow-lg' : '']"
        >
          <template v-if="plan.popular" #header>
            <div class="absolute -top-4 left-1/2 -translate-x-1/2">
              <UBadge color="primary" variant="solid" size="lg"> Najpopularniejszy </UBadge>
            </div>
          </template>

          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold mb-2">
              {{ plan.name }}
            </h3>
            <p class="text-sm text-muted mb-4">
              {{ plan.description }}
            </p>
            <div class="flex items-baseline justify-center gap-2">
              <span class="text-4xl font-bold">
                {{ plan.price }}
              </span>
              <span v-if="plan.period" class="text-muted">
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
              <UIcon name="i-lucide-check" class="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span class="text-sm">{{ feature }}</span>
            </li>
          </ul>

          <UButton
            :to="plan.ctaTo"
            :color="plan.popular ? 'primary' : 'neutral'"
            :variant="plan.popular ? 'solid' : 'outline'"
            block
            size="lg"
          >
            {{ plan.ctaText }}
          </UButton>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
