<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import { defineOrganization, defineWebSite } from 'nuxt-schema-org/schema'
import appMeta from '~/app.meta'

const { config } = useFooterConfig()

// Computed dla klas kontenera
const containerClasses = computed(() => {
  const container = config.value.container || 'default'
  return container === 'wide' ? 'max-w-7xl' : 'max-w-6xl'
})

// Computed dla klas spacing
const spacingClasses = computed(() => {
  const spacing = config.value.spacing || 'md'
  const classes: Record<string, string> = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16 md:py-20',
    lg: 'py-16 sm:py-20 md:py-24'
  }
  return classes[spacing] || classes.md
})

// Computed dla klas theme
const themeClasses = computed(() => {
  const theme = config.value.theme || 'light'
  const classes: Record<string, string> = {
    light: 'bg-background text-foreground border-t border-border',
    dark: 'bg-neutral-900 text-white border-t border-neutral-800',
    brand: 'bg-primary text-primary-foreground border-t border-primary/20'
  }
  return classes[theme] || classes.light
})

// Computed dla grid kolumn
const gridClasses = computed(() => {
  const columnCount = (config.value.columns?.length || 0)
    + (config.value.contact ? 1 : 0)
    + (config.value.social && config.value.social.length > 0 ? 1 : 0)
    + (config.value.newsletter?.enabled ? 1 : 0)

  return {
    'grid-cols-1': true,
    'sm:grid-cols-2': columnCount >= 2,
    'md:grid-cols-3': columnCount >= 3,
    'lg:grid-cols-4': columnCount >= 4,
    'xl:grid-cols-5': columnCount >= 5
  }
})

// Helper do sprawdzania czy link jest zewnętrzny
const isExternalLink = (link: { to?: string, href?: string, external?: boolean }): boolean => {
  if (link.external === true) return true
  if (link.href) {
    try {
      const url = new URL(link.href)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
  return false
}

// Helper do uzyskania target i rel dla linków zewnętrznych
const getLinkAttributes = (link: { to?: string, href?: string, external?: boolean }) => {
  const external = isExternalLink(link)
  return {
    target: external ? '_blank' : undefined,
    rel: external ? 'noopener noreferrer' : undefined
  }
}

// Scroll to top
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Copyright year
const currentYear = new Date().getFullYear()
const copyrightYear = computed(() => {
  const yearStart = config.value.legal?.yearStart
  if (yearStart) {
    const start = parseInt(yearStart, 10)
    return start === currentYear ? String(currentYear) : `${start}-${currentYear}`
  }
  return String(currentYear)
})

// Schema.org
const footerSchema = computed(() => {
  if (!config.value.schema?.enabled) return null

  const siteConfig = useSiteConfig()
  const siteUrl = siteConfig.url || 'https://example.com'

  const organizationData: Record<string, unknown> = {
    name: config.value.brand?.name || appMeta.name,
    url: siteUrl,
    logo: config.value.brand?.logo || appMeta.icon
  }

  // SameAs z social lub app.meta
  if (config.value.social && config.value.social.length > 0) {
    organizationData.sameAs = config.value.social.map(s => s.href)
  } else if (appMeta.sameAs) {
    organizationData.sameAs = appMeta.sameAs
  }

  // Email z contact lub app.meta
  if (config.value.contact?.email) {
    organizationData.email = config.value.contact.email
  } else if (appMeta.contactEmail) {
    organizationData.email = appMeta.contactEmail
  }

  // Address jeśli dostępne
  if (config.value.contact?.address) {
    organizationData.address = {
      '@type': 'PostalAddress',
      'streetAddress': config.value.contact.address
    }
  }

  // Telephone jeśli dostępne
  if (config.value.contact?.phone) {
    organizationData.telephone = config.value.contact.phone
  }

  return [
    defineOrganization(organizationData),
    defineWebSite({
      name: config.value.brand?.name || appMeta.name,
      url: siteUrl
    })
  ]
})

if (footerSchema.value) {
  useSchemaOrg(footerSchema.value.filter(Boolean))
}
</script>

<template>
  <footer :class="['w-full', themeClasses, spacingClasses]">
    <UContainer :class="containerClasses">
      <div :class="['grid gap-8 sm:gap-10 md:gap-12', gridClasses]">
        <!-- Brand Section -->
        <div
          v-if="config.brand"
          class="space-y-4"
        >
          <div class="flex items-center gap-3">
            <Logo />
            <h3
              v-if="config.brand.name"
              class="text-lg font-bold"
            >
              {{ config.brand.name }}
            </h3>
          </div>
          <p
            v-if="config.brand.description"
            class="text-sm text-muted-foreground leading-relaxed"
          >
            {{ config.brand.description }}
          </p>
        </div>

        <!-- Navigation Columns -->
        <nav
          v-for="(column, index) in config.columns"
          :key="index"
          class="space-y-3"
        >
          <h4 class="text-sm font-semibold uppercase tracking-wider">
            {{ column.title }}
          </h4>
          <ul class="space-y-2">
            <li
              v-for="(link, linkIndex) in column.links"
              :key="linkIndex"
            >
              <ULink
                :to="link.to"
                :href="link.href"
                :target="getLinkAttributes(link).target"
                :rel="getLinkAttributes(link).rel"
                class="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <UIcon
                  v-if="link.icon"
                  :name="link.icon"
                  class="w-4 h-4"
                />
                {{ link.label }}
              </ULink>
            </li>
          </ul>
        </nav>

        <!-- Contact Section -->
        <address
          v-if="config.contact"
          class="not-italic space-y-3"
        >
          <h4 class="text-sm font-semibold uppercase tracking-wider">
            Kontakt
          </h4>
          <div class="space-y-2 text-sm text-muted-foreground">
            <div
              v-if="config.contact.email"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-mail"
                class="w-4 h-4 shrink-0"
              />
              <a
                :href="`mailto:${config.contact.email}`"
                class="hover:text-foreground transition-colors"
              >
                {{ config.contact.email }}
              </a>
            </div>
            <div
              v-if="config.contact.phone"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-phone"
                class="w-4 h-4 shrink-0"
              />
              <a
                :href="`tel:${config.contact.phone}`"
                class="hover:text-foreground transition-colors"
              >
                {{ config.contact.phone }}
              </a>
            </div>
            <div
              v-if="config.contact.address"
              class="flex items-start gap-2"
            >
              <UIcon
                name="i-lucide-map-pin"
                class="w-4 h-4 shrink-0 mt-0.5"
              />
              <span>{{ config.contact.address }}</span>
            </div>
            <div
              v-if="config.contact.hours"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-clock"
                class="w-4 h-4 shrink-0"
              />
              <span>{{ config.contact.hours }}</span>
            </div>
          </div>
        </address>

        <!-- Social Media Section -->
        <div
          v-if="config.social && config.social.length > 0"
          class="space-y-3"
        >
          <h4 class="text-sm font-semibold uppercase tracking-wider">
            Social Media
          </h4>
          <div class="flex flex-wrap gap-3">
            <UButton
              v-for="(social, index) in config.social"
              :key="index"
              :href="social.href"
              target="_blank"
              rel="noopener noreferrer"
              variant="ghost"
              size="sm"
              :icon="social.icon"
              :aria-label="`${social.name} - Otwórz w nowej karcie`"
              class="rounded-full"
            />
          </div>
        </div>

        <!-- Newsletter Section -->
        <div
          v-if="config.newsletter?.enabled"
          class="space-y-3"
        >
          <h4
            v-if="config.newsletter.title"
            class="text-sm font-semibold uppercase tracking-wider"
          >
            {{ config.newsletter.title }}
          </h4>
          <p
            v-if="config.newsletter.description"
            class="text-sm text-muted-foreground"
          >
            {{ config.newsletter.description }}
          </p>
          <form
            class="flex flex-col sm:flex-row gap-2"
            @submit.prevent="() => {}"
          >
            <UInput
              type="email"
              :placeholder="config.newsletter.placeholder || 'Twój email'"
              class="flex-1"
            />
            <UButton
              type="submit"
              color="primary"
              size="sm"
            >
              {{ config.newsletter.buttonLabel || 'Zapisz się' }}
            </UButton>
          </form>
        </div>
      </div>

      <!-- Divider -->
      <USeparator class="my-8" />

      <!-- Legal Section -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div class="flex flex-wrap items-center gap-4">
          <span>
            © {{ copyrightYear }} {{ config.legal?.companyName || appMeta.name }}. Wszelkie prawa zastrzeżone.
          </span>
        </div>
        <nav class="flex flex-wrap items-center gap-4">
          <ULink
            v-if="config.legal?.privacyUrl"
            :to="config.legal.privacyUrl"
            class="hover:text-foreground transition-colors"
          >
            Polityka prywatności
          </ULink>
          <ULink
            v-if="config.legal?.termsUrl"
            :to="config.legal.termsUrl"
            class="hover:text-foreground transition-colors"
          >
            Regulamin
          </ULink>
          <ULink
            v-if="config.legal?.cookiesUrl"
            :to="config.legal.cookiesUrl"
            class="hover:text-foreground transition-colors"
          >
            Polityka cookies
          </ULink>
        </nav>
      </div>

      <!-- Back to Top Button -->
      <div
        v-if="config.backToTop"
        class="mt-8 flex justify-center"
      >
        <UButton
          variant="ghost"
          size="sm"
          icon="i-lucide-arrow-up"
          aria-label="Przewiń do góry"
          @click="scrollToTop"
        >
          Do góry
        </UButton>
      </div>
    </UContainer>
  </footer>
</template>
