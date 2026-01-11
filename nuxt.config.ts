// https://nuxt.com/docs/api/configuration/nuxt-config
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

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  // Konfiguracja modułu @nuxt/scripts
  // Moduł służy do zarządzania zewnętrznymi skryptami (Google Analytics, Facebook Pixel itp.)
  // Jeśli nie używasz żadnych zewnętrznych skryptów, możesz pozostawić pustą konfigurację
  scripts: {
    // Przykładowe konfiguracje (odkomentuj, gdy będziesz ich potrzebować):
    // googleAnalytics: {
    //   id: 'UA-XXXXXXXXX-X',
    //   defer: true,
    //   consent: false
    // },
    // facebookPixel: {
    //   id: 'XXXXXXXXXX',
    //   defer: true
    // }
  }
})
