<script setup lang="ts">
import { computed } from 'vue'
import type { SectionContact } from '#shared/types/sections'
import PageSection from '~/components/Page/Section/PageSection.vue'
import ContactForm from '~/components/Contact/Form/ContactForm.vue'

const props = defineProps<{
  section: SectionContact
}>()

const socials = computed(() => props.section.socials || [])
const map = computed(() => props.section.map)
const address = computed(() => props.section.address)
</script>

<template>
  <PageSection
    :id="section.id"
    :type="section.type"
    :section-ref="section.ref"
    :headline="section.headline"
    :title="section.title"
    :description="section.description"
    :ui="{
      header: 'max-w-3xl mx-auto text-center',
      body: 'mt-10'
    }"
  >
    <template #body>
      <div class="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-xl backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
        <ContactForm />
      </div>

      <div class="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div
          v-if="map?.embedUrl"
          class="relative overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 shadow-xl"
        >
          <iframe
            :src="map.embedUrl"
            class="h-72 w-full border-0 md:h-[360px]"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            :title="map.label || 'Mapa dojazdu'"
            allowfullscreen
          />
          <a
            v-if="map.linkUrl"
            :href="map.linkUrl"
            target="_blank"
            rel="noreferrer"
            class="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-gray-900 shadow-lg transition hover:bg-white dark:bg-gray-900/80 dark:text-white"
          >
            <UIcon
              name="i-lucide-map-pin"
              class="h-4 w-4"
            />
            Otwórz w mapach
          </a>
        </div>

        <div class="grid gap-6">
          <div
            v-if="address"
            class="rounded-2xl border border-white/10 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/60"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {{ address.label || 'Adres' }}
            </p>
            <div class="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              <p>
                {{ address.line1 }}
              </p>
              <p v-if="address.line2">
                {{ address.line2 }}
              </p>
              <p>
                <span v-if="address.postalCode">{{ address.postalCode }}, </span>{{ address.city }}
              </p>
              <p v-if="address.country">
                {{ address.country }}
              </p>
            </div>
            <p
              v-if="address.note"
              class="mt-4 text-xs text-gray-500 dark:text-gray-400"
            >
              {{ address.note }}
            </p>
          </div>

          <div
            v-if="socials.length"
            class="rounded-2xl border border-white/10 bg-white/80 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/60"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Social media
            </p>
            <div class="mt-4 flex flex-wrap gap-3">
              <NuxtLink
                v-for="social in socials"
                :key="social.to"
                :to="social.to"
                target="_blank"
                rel="noreferrer"
                class="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
              >
                <UIcon
                  v-if="social.icon"
                  :name="social.icon"
                  class="h-4 w-4"
                />
                {{ social.label }}
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </template>
  </PageSection>
</template>
