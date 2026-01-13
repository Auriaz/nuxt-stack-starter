<script setup lang="ts">
interface Props {
  title?: string
  description?: string
  ctaText?: string
  ctaTo?: string
  image?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Witamy w Nuxt Base Starter',
  description:
      'Solidna podkładka pod strony internetowe oparta o Nuxt 4, gotowa do wielokrotnego użycia i łatwa do aktualizowania.',
  ctaText: 'Zacznij teraz',
  ctaTo: '/kontakt',
  image: undefined
})
</script>

<template>
  <section class="relative py-20 md:py-32 overflow-hidden">
    <UContainer>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div class="absolute left-0 top-0 w-full h-[400px] bg-muted overflow-hidden -z-1">
          <UMarquee
            reverse
            orientation="vertical"
            :overlay="false"
            :ui="{
              root: '[--duration:40s] absolute w-[460px] -left-[100px] -top-[300px] h-[940px] transform-3d rotate-x-55 rotate-y-0 rotate-z-30'
            }"
          >
            <img
              v-for="i in [1, 2, 3, 4]"
              :key="i"
              :src="`/hero/image-${i}.png`"
              width="460"
              height="258"
              :alt="`Nuxt UI Screenshot ${i}`"
              class="aspect-video border border-default rounded-lg bg-white"
            >
          </UMarquee>
          <UMarquee
            orientation="vertical"
            :overlay="false"
            :ui="{
              root: '[--duration:40s] absolute w-[460px] -top-[400px] left-[480px] h-[1160px] transform-3d rotate-x-55 rotate-y-0 rotate-z-30'
            }"
          >
            <img
              v-for="i in [1, 2, 3, 4]"
              :key="i"
              :src="`/hero/image-${i}.png`"
              width="460"
              height="258"
              :alt="`Nuxt UI Screenshot ${i}`"
              class="aspect-video border border-default rounded-lg bg-white"
            >
          </UMarquee>
          <UMarquee
            reverse
            orientation="vertical"
            :overlay="false"
            :ui="{
              root: 'hidden md:flex [--duration:40s] absolute w-[460px] -top-[300px] left-[1020px] h-[1060px] transform-3d rotate-x-55 rotate-y-0 rotate-z-30'
            }"
          >
            <img
              v-for="i in [1, 2, 3, 4]"
              :key="i"
              :src="`/hero/image-${i}.png`"
              width="460"
              height="258"
              :alt="`Nuxt UI Screenshot ${i}`"
              class="aspect-video border border-default rounded-lg bg-white"
            >
          </UMarquee>
        </div>
        <!-- Content -->
        <div class="text-center lg:text-left bg-slate-900/80 backdrop-blur-sm shadow-2xl shadow-black py-6 px-8 rounded-lg">
          <h1 class="text-4xl md:text-5xl lg:text-6xl text-white font-bold mb-6">
            {{ props.title }}
          </h1>
          <p class="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto lg:mx-0">
            {{ props.description }}
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <UButton
              :to="props.ctaTo"
              size="lg"
              color="primary"
            >
              {{ props.ctaText }}
            </UButton>
            <UButton
              to="/oferta"
              size="lg"
              variant="outline"
            >
              Dowiedz się więcej
            </UButton>
          </div>
        </div>

        <!-- Image/Visual -->
        <div class="relative">
          <div
            v-if="props.image"
            class="relative rounded-lg overflow-hidden shadow-2xl"
          >
            <NuxtImg
              :src="props.image"
              alt="Hero image"
              class="w-full h-auto"
              loading="eager"
            />
          </div>
          <div
            v-else
            class="relative w-full h-64 md:h-96 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-sparkles"
              class="w-32 h-32 text-white opacity-50"
            />
          </div>
        </div>
      </div>
    </UContainer>
  </section>
</template>
