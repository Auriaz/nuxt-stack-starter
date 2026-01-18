---
title: 'Kontakt'
description: 'Skontaktuj się z nami. Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'
to: '/kontakt'
seo:
  title: 'Kontakt - Nuxt Base Starter'
  description: 'Skontaktuj się z nami. Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'
  image: '/images/og-image.png'
sections:
  # Hero
  - type: 'hero'
    id: 'hero'
    title: 'Skontaktuj się z nami'
    description: 'Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'
    align: 'center'
    spacing: 'lg'
    props:
      layout: 'centered'
      variant: 'primary'

  # Contact Details
  - type: 'contact-details'
    id: 'contact-details'
    title: 'Informacje kontaktowe'
    description: 'Jesteśmy dostępni od poniedziałku do piątku w godzinach 9:00-17:00.'
    align: 'left'
    spacing: 'lg'
    props:
      variant: 'cards'
      items:
        - label: 'Email'
          value: 'kontakt@example.com'
          href: 'mailto:kontakt@example.com'
          icon: 'i-lucide-mail'
        - label: 'Telefon'
          value: '+48 123 456 789'
          href: 'tel:+48123456789'
          icon: 'i-lucide-phone'
        - label: 'Adres'
          value: 'ul. Przykładowa 123\n00-000 Warszawa\nPolska'
          icon: 'i-lucide-map-pin'
        - label: 'Godziny pracy'
          value: 'Pon-Pt: 9:00-17:00'
          icon: 'i-lucide-clock'

  # Contact Form
  - type: 'contact-form'
    id: 'contact-form'
    title: 'Wyślij wiadomość'
    description: 'Wypełnij formularz, a skontaktujemy się z Tobą jak najszybciej.'
    align: 'left'
    spacing: 'lg'
    props:
      endpoint: '/api/contact'
      method: 'POST'
      fields:
        - name: 'name'
          label: 'Imię i nazwisko'
          type: 'text'
          required: true
          placeholder: 'Jan Kowalski'
          icon: 'i-lucide-user'
        - name: 'email'
          label: 'Email'
          type: 'email'
          required: true
          placeholder: 'jan.kowalski@example.com'
          icon: 'i-lucide-mail'
        - name: 'phone'
          label: 'Telefon (opcjonalnie)'
          type: 'tel'
          required: false
          placeholder: '+48 123 456 789'
          icon: 'i-lucide-phone'
        - name: 'subject'
          label: 'Temat'
          type: 'text'
          required: true
          placeholder: 'Temat wiadomości'
          icon: 'i-lucide-tag'
        - name: 'message'
          label: 'Wiadomość'
          type: 'textarea'
          required: true
          placeholder: 'Twoja wiadomość...'
      consent:
        label: 'Wyrażam zgodę na przetwarzanie danych osobowych'
        required: true
      successMessage: 'Wiadomość została wysłana pomyślnie. Skontaktujemy się z Tobą wkrótce.'
      errorMessage: 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.'

  # Map (opcjonalnie)
  - type: 'map'
    id: 'map'
    title: 'Lokalizacja'
    spacing: 'lg'
    props:
      type: 'link'
      linkUrl: 'https://www.google.com/maps'
      addressText: 'ul. Przykładowa 123, 00-000 Warszawa'
      note: 'Znajdź nas na mapie'

  # FAQ (opcjonalnie)
  - type: 'faq'
    id: 'faq'
    title: 'Często zadawane pytania'
    description: 'Odpowiedzi na najczęstsze pytania dotyczące kontaktu i współpracy.'
    align: 'center'
    spacing: 'lg'
    props:
      items:
        - question: 'Jak szybko odpowiadacie na wiadomości?'
          answer: 'Odpowiadamy na wszystkie wiadomości w ciągu 24 godzin w dni robocze.'
        - question: 'Czy oferujecie konsultacje?'
          answer: 'Tak, oferujemy bezpłatne konsultacje dla nowych projektów.'

  # CTA
  - type: 'cta'
    id: 'cta'
    title: 'Masz pytania?'
    description: 'Skontaktuj się z nami już dziś i dowiedz się, jak możemy pomóc.'
    align: 'center'
    spacing: 'lg'
    props:
      variant: 'centered'
      actions:
        - label: 'Skontaktuj się'
          to: '#contact-form'
          color: 'primary'
          variant: 'solid'
---
