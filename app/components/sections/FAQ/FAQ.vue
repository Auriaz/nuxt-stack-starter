<script setup lang="ts">
interface FAQItem {
  question: string
  answer: string
}

interface Props {
  title?: string
  description?: string
  items?: FAQItem[]
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Często zadawane pytania',
  description: 'Odpowiedzi na najczęstsze pytania',
  items: () => [
    {
      question: 'Czym jest Nuxt Base Starter?',
      answer:
          'Nuxt Base Starter to kompleksowy starter dla projektów Nuxt 4, zawierający gotowe komponenty, konfigurację SEO, i18n i wiele innych funkcji out-of-the-box.'
    },
    {
      question: 'Jak rozpocząć projekt?',
      answer:
          'Wystarczy sklonować repozytorium, zainstalować zależności i rozpocząć pracę. Wszystkie podstawowe funkcje są już skonfigurowane.'
    },
    {
      question: 'Czy mogę dostosować starter?',
      answer:
          'Tak, starter jest w pełni konfigurowalny. Możesz łatwo dostosować kolory, komponenty i funkcjonalności do swoich potrzeb.'
    },
    {
      question: 'Czy starter jest darmowy?',
      answer:
          'Tak, Nuxt Base Starter jest dostępny na licencji MIT, co oznacza że możesz go używać w projektach komercyjnych i prywatnych.'
    }
  ]
})
</script>

<template>
  <section class="py-20">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">
          {{ props.title }}
        </h2>
        <p class="text-lg text-muted max-w-2xl mx-auto">
          {{ props.description }}
        </p>
      </div>

      <div class="max-w-3xl mx-auto space-y-4">
        <UAccordion
          :items="
            props.items.map((item, index) => ({
              label: item.question,
              content: item.answer,
              defaultOpen: index === 0
            }))
          "
          color="primary"
          variant="soft"
          size="lg"
        />
      </div>
    </UContainer>
  </section>
</template>
