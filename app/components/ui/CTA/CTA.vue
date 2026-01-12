<script setup lang="ts">
  interface Props {
    title?: string
    description?: string
    primaryText?: string
    primaryTo?: string
    secondaryText?: string
    secondaryTo?: string
    variant?: 'default' | 'centered' | 'banner'
  }

  const props = withDefaults(defineProps<Props>(), {
    title: 'Gotowy do rozpoczęcia?',
    description: 'Zacznij swój projekt już dziś z Nuxt Base Starter.',
    primaryText: 'Zacznij teraz',
    primaryTo: '/kontakt',
    secondaryText: 'Dowiedz się więcej',
    secondaryTo: '/oferta',
    variant: 'default',
  })
</script>

<template>
  <section
    :class="[
      'py-16 md:py-24',
      props.variant === 'banner' ? 'bg-primary text-primary-foreground' : 'bg-muted/50',
    ]"
  >
    <UContainer>
      <div
        :class="[
          'flex flex-col gap-6',
          props.variant === 'centered' || props.variant === 'banner'
            ? 'text-center items-center'
            : 'lg:flex-row lg:items-center lg:justify-between',
        ]"
      >
        <div
          :class="[
            'flex-1',
            props.variant === 'centered' || props.variant === 'banner' ? 'max-w-2xl mx-auto' : '',
          ]"
        >
          <h2
            :class="[
              'text-2xl md:text-3xl font-bold mb-3',
              props.variant === 'banner' ? 'text-primary-foreground' : '',
            ]"
          >
            {{ props.title }}
          </h2>
          <p
            :class="[
              'text-lg',
              props.variant === 'banner' ? 'text-primary-foreground/90' : 'text-muted',
            ]"
          >
            {{ props.description }}
          </p>
        </div>

        <div
          :class="[
            'flex flex-col sm:flex-row gap-4',
            props.variant === 'centered' || props.variant === 'banner'
              ? 'justify-center'
              : 'shrink-0',
          ]"
        >
          <UButton
            :to="props.primaryTo"
            size="lg"
            :color="props.variant === 'banner' ? 'white' : 'primary'"
            :variant="props.variant === 'banner' ? 'solid' : 'solid'"
          >
            {{ props.primaryText }}
          </UButton>
          <UButton
            v-if="props.secondaryText"
            :to="props.secondaryTo"
            size="lg"
            :variant="props.variant === 'banner' ? 'outline' : 'outline'"
            :color="props.variant === 'banner' ? 'white' : 'primary'"
          >
            {{ props.secondaryText }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>
