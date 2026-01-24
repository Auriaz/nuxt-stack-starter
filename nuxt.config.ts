// https://nuxt.com/docs/api/configuration/nuxt-config
import appMeta from './app/app.meta'
import { definePerson, defineImage } from 'nuxt-schema-org/schema'
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
    '@nuxtjs/mcp-toolkit',
    '@nuxtjs/seo',
    '@vueuse/nuxt'
  ],

  imports: {
    dirs: [
      // Scan top-level composables
      '~/composables',
      // ... or scan composables nested one level deep with a specific name and file extension
      '~/composables/*/index.{ts,js,mjs,mts}',
      // ... or scan all composables within given directory
      '~/composables/**',
      '~/shared/schemas/**',
      '~/shared/types/**',
      '~/shared/utils/**'
    ]
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  site: {
    // url: appMeta.url || 'https://example.com',
    name: appMeta.name,
    description: appMeta.description,
    defaultLocale: 'pl'
  },

  runtimeConfig: {
    public: {
      plausibleDomain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || ''
    }
  },

  alias: {
    '~domain': './domain'
  },

  routeRules: {
    // Publiczne strony - prerender + default layout
    '/': { prerender: true, appLayout: 'default' },
    '/oferta': { prerender: true, appLayout: 'default' },
    '/portfolio': { prerender: true, appLayout: 'default' },
    '/portfolio/**': { prerender: true, appLayout: 'default' },
    '/o-nas': { prerender: true, appLayout: 'default' },
    '/kontakt': { cache: false, appLayout: 'default' }, // SSR dla formularza
    '/blog': { prerender: true, appLayout: 'default' },
    '/blog/**': { prerender: true, appLayout: 'default' },
    // Dashboard - może wymagać innego layoutu w przyszłości
    '/dashboard/**': { appLayout: 'default' }
  },

  experimental: {
    asyncContext: true,
    // Nuxt 4.2: Extract async data handlers for better bundle size (especially for prerendered pages)
    extractAsyncDataHandlers: true,
    // Nuxt 4.2: Enhanced TypeScript DX with smart navigation and auto-import support
    typescriptPlugin: true
  },

  compatibilityDate: '2025-01-15',

  nitro: {
    experimental: {
      wasm: true
    },
    rollupConfig: {
      external: [/^@prisma\//, /\.wasm$/]
    },
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt'],
      ignore: ['/__nuxt_content/content/query']
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
  },

  mcp: {
    name: 'Fullstack Base Starter'
  },

  schemaOrg: {
    identity: definePerson(appMeta.author),
    publisher: definePerson(appMeta.author),
    logo: defineImage({
      url: appMeta.icon,
      alt: appMeta.name
    }),
    sameAs: appMeta.sameAs
  }
})
