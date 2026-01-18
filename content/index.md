---
title: 'Home'
description: 'Home page'
to: '/'
sections:
  - type: 'hero'
    id: 'hero'
    title: 'Witamy w Nuxt Base Starter'
    subtitle: 'Profesjonalny starter dla nowoczesnych aplikacji'
    description: 'Solidna podkładka pod strony internetowe oparta o Nuxt 4, gotowa do wielokrotnego użycia i łatwa do aktualizowania.'
    align: 'center'
    theme: 'light'
    spacing: 'lg'
    props:
      layout: 'split'
      variant: 'primary'
      image:
        src: '/images/hero/home_1.png'
        alt: 'Nuxt Base Starter'
        position: 'right'
      actions:
        - label: 'Zacznij teraz'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'
        - label: 'Dowiedz się więcej'
          to: '/oferta'
          variant: 'outline'
          size: 'lg'
    schema:
      enabled: true
      type: 'WebPage'

  - type: 'social-proof'
    id: 'social-proof'
    title: 'Zaufali nam'
    align: 'center'
    spacing: 'md'
    props:
      variant: 'logos'
      logos:
        - src: 'https://avatars.githubusercontent.com/u/26349096?v=4'
          alt: 'Client 1'
        - src: '/images/avatars/goku.jpg'
          alt: 'Client 2'

  - type: 'features'
    id: 'features'
    title: 'Nasze funkcje'
    description: 'Wszystko czego potrzebujesz do rozpoczęcia projektu'
    align: 'center'
    spacing: 'lg'
    props:
      items:
        - title: 'Nuxt 4'
          description: 'Najnowsza wersja Nuxt z pełnym wsparciem dla TypeScript i Vue 3.'
          icon: 'i-lucide-zap'
          badge: 'Nowość'
        - title: 'Nuxt UI'
          description: 'Gotowe komponenty UI zgodne z najlepszymi praktykami design system.'
          icon: 'i-lucide-palette'
        - title: 'SEO Ready'
          description: 'Kompletna konfiguracja SEO z meta tags, sitemap i OpenGraph.'
          icon: 'i-lucide-search'
        - title: 'i18n'
          description: 'Wielojęzyczność out-of-the-box z obsługą PL i EN.'
          icon: 'i-lucide-languages'
        - title: 'TypeScript'
          description: 'Pełne wsparcie TypeScript dla bezpieczeństwa typów.'
          icon: 'i-lucide-code'
        - title: 'Testy'
          description: 'Konfiguracja testów: Vitest (unit/component) i Playwright (E2E).'
          icon: 'i-lucide-check-circle'
      layout: 'grid'
      columns: 3
      variant: 'cards'

  - type: 'process'
    id: 'process'
    title: 'Jak działamy'
    align: 'center'
    spacing: 'md'
    props:
      steps:
        - title: 'Konsultacja'
          description: 'Omawiamy potrzeby i wymagania projektu'
          icon: 'i-lucide-message-circle'
          number: 1
        - title: 'Projekt'
          description: 'Tworzymy rozwiązanie dopasowane do Twoich potrzeb'
          icon: 'i-lucide-pencil'
          number: 2
        - title: 'Implementacja'
          description: 'Realizujemy projekt z dbałością o szczegóły'
          icon: 'i-lucide-code'
          number: 3
        - title: 'Wdrożenie'
          description: 'Wspieramy Cię w uruchomieniu i utrzymaniu'
          icon: 'i-lucide-rocket'
          number: 4
      layout: 'horizontal'
      variant: 'default'

  - type: 'portfolio'
    id: 'portfolio'
    title: 'Nasze projekty'
    align: 'center'
    spacing: 'lg'
    props:
      projects:
        - title: 'Projekt 1'
          description: 'Opis projektu 1'
          image:
            src: '/portfolio/project_1.png'
            alt: 'Projekt 1'
          tags: ['Nuxt', 'Vue']
          to: '/portfolio/project-1'
          featured: true
        - title: 'Projekt 2'
          description: 'Opis projektu 2'
          image:
            src: '/portfolio/project_2.png'
            alt: 'Projekt 2'
          tags: ['Laravel', 'PHP']
          to: '/portfolio/project-2'
      layout: 'grid'
      columns: 3

  - type: 'faq'
    id: 'faq'
    title: 'Często zadawane pytania'
    align: 'center'
    spacing: 'md'
    props:
      items:
        - question: 'Czym jest Nuxt Base Starter?'
          answer: 'Nuxt Base Starter to kompleksowy starter dla projektów Nuxt 4, zawierający gotowe komponenty, konfigurację SEO, i18n i wiele innych funkcji out-of-the-box.'
        - question: 'Jak rozpocząć projekt?'
          answer: 'Wystarczy sklonować repozytorium, zainstalować zależności i rozpocząć pracę. Wszystkie podstawowe funkcje są już skonfigurowane.'
        - question: 'Czy mogę dostosować starter?'
          answer: 'Tak, starter jest w pełni konfigurowalny. Możesz łatwo dostosować kolory, komponenty i funkcjonalności do swoich potrzeb.'
        - question: 'Czy starter jest darmowy?'
          answer: 'Tak, Nuxt Base Starter jest dostępny na licencji MIT, co oznacza że możesz go używać w projektach komercyjnych i prywatnych.'
      variant: 'accordion'
      defaultOpen: 0
    schema:
      enabled: true

  - type: 'cta'
    id: 'cta'
    title: 'Gotowy do rozpoczęcia?'
    description: 'Zacznij swój projekt już dziś z Nuxt Base Starter'
    align: 'center'
    spacing: 'lg'
    theme: 'brand'
    props:
      actions:
        - label: 'Kontakt'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'
        - label: 'Portfolio'
          to: '/portfolio'
          variant: 'outline'
          size: 'lg'
      variant: 'centered'
      highlight: 'Bezpłatna konsultacja'
      note: 'Odpowiemy w ciągu 24 godzin'
seo:
  title: 'Home'
  description: 'Home page'
---

# My First Page

Here is some content.
