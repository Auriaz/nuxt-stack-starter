<script setup lang="ts">
import type { SectionFeatures } from '#shared/types/sections'
import PageSection from '~/components/Page/Section/PageSection.vue'

defineProps<{
  section: SectionFeatures
}>()
</script>

<template>
  <PageSection
    :headline="section.headline"
    :icon="section.icon"
    :title="section.title"
    :description="section.description"
    :features="section.features"
    :reverse="section.reverse"
    :type="section.type"
    :ui="{
      header: 'max-w-2xl mx-auto text-center',
      body: 'mt-10',
      ...section.ui
    }"
  >
    <template #features>
      <div class="sr-only">
        {{ section.title }}
      </div>
      <div class="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <component
          :is="feature.to ? 'NuxtLink' : 'div'"
          v-for="(feature, index) in (section.features || [])"
          :key="`${feature.title}-${index}`"
          :to="feature.to || undefined"
          :target="feature.target || undefined"
          class="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60"
        >
          <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div class="absolute -top-20 right-0 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
            <div class="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>

          <div class="relative z-10 flex items-start gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-colors duration-300"
              :class="[
                index % 6 === 0 && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
                index % 6 === 1 && 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
                index % 6 === 2 && 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
                index % 6 === 3 && 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
                index % 6 === 4 && 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
                index % 6 === 5 && 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300'
              ]"
            >
              <UIcon
                v-if="feature.icon"
                :name="feature.icon"
                class="h-6 w-6"
              />
              <span
                v-else
                class="text-sm font-semibold"
              >
                {{ index + 1 }}
              </span>
            </div>

            <div class="space-y-2">
              <h3 class="text-base font-semibold text-gray-900 dark:text-white">
                {{ feature.title }}
              </h3>
              <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </component>
      </div>
    </template>
  </PageSection>
</template>
