---
title: Oferta
description: Nasza oferta - wybierz plan dopasowany do Twoich potrzeb
to: '/oferta'
sections:
  - type: 'hero'
    id: 'hero'
    title: 'Nasza oferta'
    description: 'Wybierz plan dopasowany do Twoich potrzeb'
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

  - type: 'pricing'
    id: 'pricing'
    title: 'Cennik'
    description: 'Wybierz plan dopasowany do Twoich potrzeb'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'grid'
      plans:
        - name: 'Podstawowy'
          price: '999'
          period: 'PLN'
          description: 'Idealny dla małych projektów'
          features:
            - 'Strona główna + 3 podstrony'
            - 'Responsywny design'
            - 'Podstawowe SEO'
            - 'Formularz kontaktowy'
            - 'Wsparcie email'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'neutral'
            variant: 'outline'
        - name: 'Standardowy'
          price: '2499'
          period: 'PLN'
          description: 'Najpopularniejszy wybór'
          popular: true
          features:
            - 'Wszystko z planu Podstawowy'
            - 'Do 10 podstron'
            - 'Zaawansowane SEO'
            - 'Blog'
            - 'Integracje zewnętrzne'
            - 'Priorytetowe wsparcie'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'primary'
            variant: 'solid'
        - name: 'Premium'
          price: '4999'
          period: 'PLN'
          description: 'Dla wymagających projektów'
          features:
            - 'Wszystko z planu Standardowy'
            - 'Nielimitowane podstrony'
            - 'E-commerce'
            - 'Panel administracyjny'
            - 'Dedykowane wsparcie'
            - 'Szkolenia'
          action:
            label: 'Wybierz plan'
            to: '/kontakt'
            color: 'primary'
            variant: 'solid'

  - type: 'faq'
    id: 'faq'
    title: 'Często zadawane pytania'
    description: 'Odpowiedzi na najczęstsze pytania dotyczące oferty'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'accordion'
      items:
        - question: 'Jak wybrać odpowiedni plan?'
          answer: 'Wybierz plan w zależności od wielkości projektu i potrzeb. Plan Podstawowy jest idealny dla małych stron, Standardowy dla większości projektów, a Premium dla zaawansowanych rozwiązań.'
        - question: 'Czy mogę zmienić plan później?'
          answer: 'Tak, możesz zmienić plan w dowolnym momencie. Różnica w cenie zostanie rozliczona proporcjonalnie.'
        - question: 'Co zawiera wsparcie?'
          answer: 'Wsparcie obejmuje pomoc techniczną, aktualizacje i konsultacje. W planie Premium otrzymujesz dedykowane wsparcie z priorytetem.'

  - type: 'cta'
    id: 'cta'
    title: 'Gotowy na start?'
    description: 'Skontaktuj się z nami, aby omówić Twój projekt'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'centered'
      actions:
        - label: 'Skontaktuj się'
          to: '/kontakt'
          color: 'primary'
          variant: 'solid'
          size: 'lg'
---
