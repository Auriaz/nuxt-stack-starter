---
title: 'Home'
description: 'Home page'
to: '/'
sections:
  hero:
    type: 'hero'
    id: 'homepage-hero'
    ref: 'homepage-hero'
    title: 'Witamy w Nuxt Base Starter'
    description: 'Solidna podkładka pod strony internetowe oparta o Nuxt 4, gotowa do wielokrotnego użycia i łatwa do aktualizowania.'
    headline: 'HERO PAGE'
    image:
      src: '/images/hero/home_1.png'
      alt: 'Nuxt Base Starter'
    links:
      - label: 'Zacznij teraz'
        to: '/kontakt'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
      - label: 'Dowiedz się więcej'
        to: '/oferta'
        variant: 'outline'
        size: 'lg'
    reverse: false
    orientation: 'horizontal'
  features:
    type: 'features'
    id: 'homepage-features'
    ref: 'homepage-features'
    title: 'Nasze funkcje'
    description: 'Wszystko czego potrzebujesz do rozpoczęcia projektu'
    orientation: 'vertical'
    features:
      - title: 'Nuxt 4'
        description: 'Najnowsza wersja Nuxt z pełnym wsparciem dla TypeScript i Vue 3.'
        icon: 'i-lucide-zap'
        to: '/blog/nuxt-4'
      - title: 'Nuxt UI'
        description: 'Gotowe komponenty UI zgodne z najlepszymi praktykami design system.'
        icon: 'i-lucide-palette'
        to: '/blog/nuxt-ui'
      - title: 'SEO Ready'
        description: 'Kompletna konfiguracja SEO z meta tags, sitemap i OpenGraph.'
        icon: 'i-lucide-search'
        to: '/blog/seo-ready'
      - title: 'i18n'
        description: 'Wielojęzyczność out-of-the-box z obsługą PL i EN.'
        icon: 'i-lucide-languages'
      - title: 'TypeScript'
        description: 'Pełne wsparcie TypeScript dla bezpieczeństwa typów.'
        icon: 'i-lucide-code'
      - title: 'Testy'
        description: 'Konfiguracja testów: Vitest (unit/component) i Playwright (E2E).'
        icon: 'i-lucide-check-circle'

  testimonials:
    type: 'testimonials'
    id: 'homepage-testimonials'
    ref: 'homepage-testimonials'
    headline: 'OPINIE KLIENTÓW'
    title: 'Co mówią o nas nasi klienci'
    description: 'Zaufało nam już ponad 80 firm. Zobacz, co mówią o współpracy z nami.'
    layout: 'carousel'
    orientation: 'vertical'
    reverse: false
    enabled: true
    items:
      - quote: 'Współpraca z tym zespołem to czysta przyjemność. Profesjonalizm na najwyższym poziomie, terminowość i świetna komunikacja. Nasza aplikacja działa bez zarzutu, a użytkownicy są zachwyceni interfejsem.'
        author:
          name: 'Anna Kowalska'
          role: 'CEO'
          company: 'TechStart Solutions'
        rating: 5
        featured: true
      - quote: 'Potrzebowaliśmy szybkiego wdrożenia nowej platformy e-commerce. Zespół dostarczył rozwiązanie w rekordowym czasie, nie tracąc przy tym na jakości. Wydajność strony jest fenomenalna, a panel administracyjny bardzo intuicyjny.'
        author:
          name: 'Marek Nowak'
          role: 'Founder & CTO'
          company: 'ShopFlow'
        rating: 5
      - quote: 'Najlepsze doświadczenie z firmą IT jakie miałem. Od analizy wymagań, przez projektowanie UX/UI, po wdrożenie - wszystko przebiegło gładko. Szczególnie doceniam proaktywne podejście i sugestie optymalizacyjne.'
        author:
          name: 'Piotr Wiśniewski'
          role: 'Product Manager'
          company: 'FinanceApp'
        rating: 5
      - quote: 'Modernizacja naszego legacy systemu była dużym wyzwaniem. Zespół nie tylko świetnie poradził sobie technicznie, ale też cierpliwie tłumaczył każdy krok procesu. Migracja przebiegła bez przestojów w działaniu firmy.'
        author:
          name: 'Katarzyna Zielińska'
          role: 'IT Director'
          company: 'MediaCorp'
        rating: 5
  cta:
    type: 'cta'
    id: 'homepage-cta'
    ref: 'homepage-cta'
    title: 'Gotowy do rozpoczęcia?'
    description: 'Zacznij swój projekt już dziś z Nuxt Base Starter'
    reverse: false
    enabled: true
    links:
      - label: 'Kontakt'
        to: '/kontakt'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
      - label: 'Portfolio'
        to: '/portfolio'
        variant: 'outline'
        size: 'lg'
    variant: 'soft'
    orientation: 'vertical'
    ui:
      root: 'my-12'
  seo:
    title: 'Home'
    description: 'Home page'
---

:PageHero{:hero="sections.hero"}
:PageSection{:section="sections.features"}
:PageTestimonials{:section="sections.testimonials"}
:PageCTA{:cta="sections.cta"}
