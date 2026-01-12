<script setup lang="ts">
  interface Feature {
    title: string
    description: string
    icon: string
  }

  interface Props {
    title?: string
    description?: string
    features?: Feature[]
  }

  const props = withDefaults(defineProps<Props>(), {
    title: 'Funkcje',
    description: 'Wszystko czego potrzebujesz do rozpoczęcia projektu',
    features: () => [
      {
        title: 'Nuxt 4',
        description: 'Najnowsza wersja Nuxt z pełnym wsparciem dla TypeScript i Vue 3.',
        icon: 'i-lucide-zap',
      },
      {
        title: 'Nuxt UI',
        description: 'Gotowe komponenty UI zgodne z najlepszymi praktykami design system.',
        icon: 'i-lucide-palette',
      },
      {
        title: 'SEO Ready',
        description: 'Kompletna konfiguracja SEO z meta tags, sitemap i OpenGraph.',
        icon: 'i-lucide-search',
      },
      {
        title: 'i18n',
        description: 'Wielojęzyczność out-of-the-box z obsługą PL i EN.',
        icon: 'i-lucide-languages',
      },
      {
        title: 'TypeScript',
        description: 'Pełne wsparcie TypeScript dla bezpieczeństwa typów.',
        icon: 'i-lucide-code',
      },
      {
        title: 'Testy',
        description: 'Konfiguracja testów: Vitest (unit/component) i Playwright (E2E).',
        icon: 'i-lucide-check-circle',
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
        <div
          v-for="(feature, index) in props.features"
          :key="index"
          class="p-6 rounded-lg bg-background border border-border hover:shadow-lg transition-shadow"
        >
          <div class="flex items-center gap-4 mb-4">
            <div class="p-3 rounded-lg bg-primary/10 text-primary">
              <UIcon :name="feature.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-semibold">
              {{ feature.title }}
            </h3>
          </div>
          <p class="text-muted">
            {{ feature.description }}
          </p>
        </div>
      </div>
    </UContainer>
  </section>
</template>
