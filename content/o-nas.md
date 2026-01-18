---
title: 'O nas'
description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
to: '/o-nas'
seo:
  title: 'O nas - Nuxt Base Starter'
  description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
  image: '/images/og-image.png'
sections:
  # Hero - Intro / Misja
  - type: 'hero'
    id: 'hero'
    title: 'O nas'
    description: 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'centered'
      variant: 'primary'
      actions:
        - label: 'Skontaktuj się'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'

  # Features - Wartości firmy
  - type: 'features'
    id: 'values'
    title: 'Nasze wartości'
    description: 'To, co nas wyróżnia i napędza do działania'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'grid'
      columns: 3
      variant: 'cards'
      items:
        - title: 'Skupienie na jakości'
          description: 'Każdy projekt realizujemy z dbałością o szczegóły i najwyższą jakość kodu.'
          icon: 'i-lucide-target'
        - title: 'Innowacyjność'
          description: 'Wykorzystujemy najnowsze technologie i najlepsze praktyki w branży.'
          icon: 'i-lucide-lightbulb'
        - title: 'Pasja'
          description: 'Kochamy to, co robimy i dzielimy się naszą wiedzą z innymi.'
          icon: 'i-lucide-heart'

  # Process - Jak pracujemy
  - type: 'process'
    id: 'process'
    title: 'Jak pracujemy'
    description: 'Nasz proces tworzenia rozwiązań'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'vertical'
      variant: 'default'
      steps:
        - title: 'Analiza potrzeb'
          description: 'Rozmawiamy z klientem, analizujemy wymagania i cele biznesowe.'
          icon: 'i-lucide-search'
          number: 1
        - title: 'Projektowanie'
          description: 'Tworzymy architekturę i projekt rozwiązania dostosowany do potrzeb.'
          icon: 'i-lucide-palette'
          number: 2
        - title: 'Realizacja'
          description: 'Implementujemy rozwiązanie z dbałością o jakość i najlepsze praktyki.'
          icon: 'i-lucide-code'
          number: 3
        - title: 'Wdrożenie i wsparcie'
          description: 'Wdrażamy rozwiązanie i zapewniamy ciągłe wsparcie techniczne.'
          icon: 'i-lucide-rocket'
          number: 4

  # Social Proof - Statystyki
  - type: 'social-proof'
    id: 'stats'
    title: 'Nasze osiągnięcia'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'stats'
      stats:
        - value: '100+'
          label: 'Zrealizowanych projektów'
          icon: 'i-lucide-briefcase'
        - value: '50+'
          label: 'Zadowolonych klientów'
          icon: 'i-lucide-users'
        - value: '5+'
          label: 'Lat doświadczenia'
          icon: 'i-lucide-calendar'

  # CTA - Kontakt
  - type: 'cta'
      id: 'cta'
      title: 'Gotowy do rozpoczęcia?'
      description: 'Zacznij swój projekt już dziś z Nuxt Base Starter'
      align: 'center'
      spacing: 'none'
      theme: 'brand'
      reverse: true
      container: 'full'
      props:
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
        highlight: 'Bezpłatna konsultacja'
        note: 'Odpowiemy w ciągu 24 godzin'
---
