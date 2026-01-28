<script setup lang="ts">
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import { defineOrganization, defineWebSite } from 'nuxt-schema-org/schema'
import appMeta from '~/app.meta'

const { config } = useFooterConfig()
const { locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const isBrandTheme = computed(() => config.value.theme === 'brand')

type LocaleOption = { code: string, name?: string }

const localeOptions = computed(() =>
  (locales.value as Array<string | LocaleOption>).map((item) => {
    if (typeof item === 'string') {
      return { code: item, name: item.toUpperCase() }
    }
    return {
      code: item.code,
      name: item.name || item.code.toUpperCase()
    }
  })
)

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
    light: 'bg-background text-foreground border-t border-gray-200 dark:border-gray-800',
    dark: 'bg-neutral-900 text-white border-t border-neutral-800',
    brand: 'bg-gradient-to-b from-elevated-950/80 via-slate-950 to-slate-950 text-white border-t border-primary/30'
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
  <footer :class="['relative isolate overflow-hidden w-full', themeClasses, spacingClasses]">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -top-40 right-0 h-72 w-72 rounded-full bg-elevated/20 blur-[140px]" />
      <div class="absolute left-10 top-16 h-64 w-64 rounded-full bg-sky-500/20 blur-[130px]" />
      <div class="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/20 blur-[160px]" />
    </div>

    <UContainer :class="containerClasses">
      <div :class="['relative w-full z-10 grid gap-8 sm:gap-10 md:gap-12', gridClasses]">
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
            :class="[
              'text-sm leading-relaxed',
              isBrandTheme ? 'text-white/70' : 'text-muted-foreground/80'
            ]"
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
          <h4 class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
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
                :class="[
                  'text-sm transition-colors flex items-center gap-2',
                  isBrandTheme ? 'text-white/70 hover:text-white' : 'text-muted-foreground/80 hover:text-primary'
                ]"
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
          class="not-italic col-span-2 gap-4 w-full"
        >
          <h4 class="col-span-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            Kontakt
          </h4>
          <div class="col-span-2 space-y-2 text-sm text-muted-foreground">
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
          class="col-span-1 gap-3"
        >
          <h4 class="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
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
          class="col-span-2 gap-4 w-full"
        >
          <h4
            v-if="config.newsletter.title"
            class="col-span-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80"
          >
            {{ config.newsletter.title }}
          </h4>

          <p
            v-if="config.newsletter.description"
            class="col-span-2 text-sm text-muted-foreground"
          >
            {{ config.newsletter.description }}
          </p>

          <form
            class="col-span-2 flex flex-col gap-2 sm:flex-row"
            @submit.prevent="() => {}"
          >
            <UInput
              type="email"
              :placeholder="config.newsletter.placeholder || 'Twój email'"
              class="flex-1 bg-white/10 border-white/10 text-white placeholder:text-white/60 w-full"
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
      <USeparator class="my-8 opacity-40" />

      <!-- Legal Section -->
      <div
        :class="[
          'relative z-10 flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between',
          isBrandTheme ? 'text-white/60' : 'text-muted-foreground'
        ]"
      >
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
            class="hover:text-primary transition-colors"
          >
            Polityka cookies
          </ULink>
        </nav>
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs uppercase tracking-[0.2em] text-primary/70">
            Język
          </span>
          <UButton
            v-for="option in localeOptions"
            :key="option.code"
            :to="switchLocalePath(option.code)"
            variant="ghost"
            size="xs"
            :class="[
              'rounded-full px-3',
              option.code === locale ? 'bg-primary/15 text-primary' : 'text-muted-foreground/80 hover:text-primary'
            ]"
          >
            {{ option.name }}
          </UButton>
        </div>
      </div>
    </UContainer>
  </footer>
</template>
