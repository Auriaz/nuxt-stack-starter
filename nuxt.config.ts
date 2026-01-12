// https://nuxt.com/docs/api/configuration/nuxt-config
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - auto-importowane przez Nuxt
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/a11y',
    '@nuxt/content',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@nuxtjs/i18n',
    '@nuxtjs/seo'
  ],

  imports: {
    dirs: ['shared/types', 'shared/utils']
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    name: 'Base Starter',
    description: 'Nuxt Base Starter - solid foundation for web projects',
    defaultLocale: 'pl'
  },

  runtimeConfig: {
    public: {
      plausibleDomain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || ''
    }
  },

  routeRules: {
    '/': { prerender: true },
    '/oferta': { prerender: true },
    '/portfolio': { prerender: true },
    '/o-nas': { prerender: true },
    '/kontakt': { cache: false }, // SSR dla formularza
    '/blog/**': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt']
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      { code: 'pl', iso: 'pl-PL', file: 'pl.json', name: 'Polski' },
      { code: 'en', iso: 'en-US', file: 'en.json', name: 'English' }
    ],
    defaultLocale: 'pl',
    strategy: 'prefix_except_default', // /oferta (PL), /en/offer (EN)
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected'
    }
  }
})
