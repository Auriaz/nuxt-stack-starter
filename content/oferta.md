---
title: Oferta
description: Nasza oferta - wybierz plan dopasowany do Twoich potrzeb
to: '/oferta'
sections:
  pricing:
    pricing:
    type: 'pricing'
    id: 'pricing'
    title: 'Wybierz swój plan'
    description: 'Elastyczne plany dopasowane do Twoich potrzeb'
    headline: 'CENNIK'
    orientation: 'vertical'
    enabled: true
    plans:
      - title: 'Starter'
        description: 'Dla małych projektów'
        badge: 'Popularny'
        price: '$99'
        billingCycle: '/miesiąc'
        billingPeriod: 'płatne rocznie'
        features:
          - 'Jeden developer'
          - 'Nielimitowane projekty'
          - 'Wsparcie email'
        button:
          label: 'Wybierz plan'
          color: 'primary'
          variant: 'solid'
          size: 'lg'
          block: true
        highlight: true

      - title: 'Pro'
        description: 'Dla rozwijających się firm'
        badge:
          label: 'Najlepszy'
          color: 'success'
          variant: 'solid'
        price: '$299'
        discount: '$249'
        billingCycle: '/miesiąc'
        features:
          - title: 'Do 5 developerów'
            icon: 'i-lucide-users'
          - title: 'Nielimitowane projekty'
            icon: 'i-lucide-folder'
          - title: 'Wsparcie priorytetowe'
            icon: 'i-lucide-headphones'
        button:
          label: 'Wybierz plan'
          color: 'success'
          size: 'lg'
          block: true
        scale: true

      - title: 'Enterprise'
        description: 'Dla dużych organizacji'
        price: 'Kontakt'
        features:
          - 'Nielimitowani developerzy'
          - 'Dedykowany support'
          - 'SLA 99.9%'
        button:
          label: 'Kontakt'
          variant: 'outline'
          size: 'lg'
          block: true
          to: '/kontakt'
  cta:
    type: 'cta'
    id: 'cta-offer'
    ref: 'cta-offer'
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
    orientation: 'horizontal'
    ui:
      root: 'my-12'
seo:
  title: 'Oferta'
  description: 'Nasza oferta - wybierz plan dopasowany do Twoich potrzeb'
---

:PagePricing{:section="sections.pricing"}
:PageCTA{:cta="cta"}
