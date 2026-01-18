# Jak dodać nową sekcję typu "pricing"

Ten dokument opisuje krok po kroku, jak dodać nową sekcję do page buildera.

## Krok 1: Dodaj schemat w `shared/schemas/sections.ts`

```typescript
// SectionPricingSchema
export const SectionPricingSchema = merge([
  SectionBaseSchema,
  object({
    type: literal('pricing'),
    props: object({
      plans: array(
        object({
          name: string(),
          price: string(),
          period: optional(string()),
          features: array(string()),
          action: HeroActionSchema,
          featured: optional(boolean()),
        })
      ),
      layout: optional(picklist(['grid', 'table'] as const)),
    }),
  }),
])
```

Następnie dodaj do union:

```typescript
export const SectionSchema = union([
  // ... istniejące sekcje
  SectionPricingSchema,
])
```

## Krok 2: Dodaj typ w `shared/types/sections.ts`

```typescript
export type SectionPricing = InferOutput<typeof SectionPricingSchema>

export type Section =
  | SectionHero
  | // ... inne sekcje
  | SectionPricing
```

## Krok 3: Stwórz komponent `SectionsPricing.vue`

Utwórz plik `app/components/sections/Pricing/SectionsPricing.vue`:

```vue
<script setup lang="ts">
  import type { SectionPricing, SectionBase } from '#shared/types/sections'

  interface Props {
    section: SectionPricing
    base: SectionBase
    props: SectionPricing['props']
  }

  const props = defineProps<Props>()

  const config = computed(() => ({
    title: props.base.title,
    description: props.base.description,
    plans: props.props?.plans || [],
    layout: props.props?.layout || 'grid',
    align: props.base.align || 'center',
  }))
</script>

<template>
  <div>
    <!-- Header -->
    <div v-if="config.title || config.description" class="mb-12">
      <h2 v-if="config.title" class="text-3xl md:text-4xl font-bold mb-4">
        {{ config.title }}
      </h2>
      <p v-if="config.description" class="text-lg text-muted">
        {{ config.description }}
      </p>
    </div>

    <!-- Plans Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <UCard
        v-for="(plan, index) in config.plans"
        :key="index"
        :class="plan.featured ? 'border-primary border-2' : ''"
      >
        <div>
          <h3 class="text-2xl font-bold mb-2">{{ plan.name }}</h3>
          <div class="mb-4">
            <span class="text-4xl font-bold">{{ plan.price }}</span>
            <span v-if="plan.period" class="text-muted">{{ plan.period }}</span>
          </div>
          <ul class="space-y-2 mb-6">
            <li v-for="(feature, fIndex) in plan.features" :key="fIndex">
              {{ feature }}
            </li>
          </ul>
          <UButton
            :to="plan.action.to"
            :color="plan.action.color || 'primary'"
            :variant="plan.action.variant || 'solid'"
            class="w-full"
          >
            {{ plan.action.label }}
          </UButton>
        </div>
      </UCard>
    </div>
  </div>
</template>
```

## Krok 4: Zarejestruj w SectionsRenderer.vue

Dodaj komponent do renderera w `app/components/sections/SectionsRenderer.vue`:

```vue
<!-- Pricing Section -->
<SectionsPricing
  v-else-if="section.type === 'pricing'"
  :section="section"
  :base="getSectionBase(section)"
  :props="section.props"
/>
```

## Krok 5: Użyj w content

W `content/index.md` lub innych plikach markdown:

```yaml
sections:
  - type: 'pricing'
    id: 'pricing'
    title: 'Cennik'
    description: 'Wybierz plan dla siebie'
    align: 'center'
    spacing: 'lg'
    props:
      plans:
        - name: 'Basic'
          price: '99'
          period: '/miesiąc'
          features:
            - 'Funkcja 1'
            - 'Funkcja 2'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'primary'
          featured: false
      layout: 'grid'
```

## Uwagi

- Komponent jest czysto prezentacyjny - nie zawiera logiki fetchowania danych
- Wszystkie dane pochodzą z props
- Wspiera wspólne pola z SectionBase (title, description, align, theme, spacing, etc.)
- Możesz dodać Schema.org jeśli potrzebne (np. Product schema dla pricing)
