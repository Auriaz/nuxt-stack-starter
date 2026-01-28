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
    '@vueuse/nuxt',
    'nuxt-auth-utils'
  ],

  devtools: {
    enabled: true
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: appMeta.name,
    description: appMeta.description,
    defaultLocale: 'pl'
  },

  runtimeConfig: {
    public: {
      plausibleDomain: process.env.NUXT_PUBLIC_PLAUSIBLE_DOMAIN || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    }
  },

  alias: {
    '~domain': './domain'
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
    // Workaround dla błędu "File URL path must be absolute" na Windows przy prerenderze:
    // wymuszamy cache w pamięci zamiast domyślnego drivera plikowego.
    storage: {
      cache: {
        driver: 'memory'
      }
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
