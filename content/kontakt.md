---
title: 'Kontakt'
description: 'Skontaktuj się z nami. Odpowiadamy w ciągu 24h. Oferujemy bezpłatną konsultację dla nowych projektów.'
to: '/kontakt'
seo:
  title: 'Kontakt - Nuxt Base Starter | Skontaktuj się z nami'
  description: 'Masz pytania o projekt? Chcesz dowiedzieć się więcej o naszych usługach? Skontaktuj się z nami - odpowiadamy w ciągu 24h.'
  image: '/images/og-image-contact.png'
  ogType: 'website'

# Hero - Główny header
sections:
  - type: 'hero'
    id: 'contact-hero'
    ref: 'contact-hero'
    enabled: true
    headline: 'KONTAKT'
    title: 'Porozmawiajmy o Twoim projekcie'
    description: 'Jesteśmy tutaj, aby odpowiedzieć na Twoje pytania i pomóc w realizacji projektu. Oferujemy bezpłatną konsultację, podczas której omówimy Twoje potrzeby i zaproponujemy najlepsze rozwiązanie.'
    links:
      - label: 'kontakt@nuxt-starter.pl'
        to: 'mailto:kontakt@nuxt-starter.pl'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
        icon: 'i-lucide-mail'
      - label: '+48 123 456 789'
        to: 'tel:+48123456789'
        variant: 'outline'
        size: 'lg'
        icon: 'i-lucide-phone'

  # CTA - Wezwanie do działania
  - type: 'cta'
    id: 'contact-cta'
    ref: 'contact-cta'
    enabled: true
    title: 'Gotowy na rozmowę?'
    description: 'Skontaktuj się z nami już dziś. Pierwsza konsultacja jest bezpłatna - opowiemy Ci, jak możemy pomóc w realizacji Twojego projektu.'
    variant: 'soft'
    links:
      - label: 'Wyślij email'
        to: 'mailto:kontakt@nuxt-starter.pl'
        color: 'primary'
        variant: 'solid'
        size: 'lg'
        icon: 'i-lucide-send'
      - label: 'Zadzwoń'
        to: 'tel:+48123456789'
        variant: 'outline'
        size: 'lg'
        icon: 'i-lucide-phone-call'
    ui:
      root: ''
---
