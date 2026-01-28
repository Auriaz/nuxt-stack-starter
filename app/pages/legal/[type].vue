<script setup lang="ts">
definePageMeta({
  layout: 'legal'
})

const route = useRoute()
const { locale } = useI18n()
const lang = ref('en')

const itemsSelected = ref(['en', 'pl'])

// Pobranie typu dokumentu z parametru URL (terms, privacy itp.)
const docType = computed(() => route.params.type as string)

if (locale.value === 'en-US') {
  locale.value = 'en'
}

// Określenie ścieżki do dokumentu na podstawie typu i języka
const docPath = computed(() => `${route.path}/${locale.value || 'en'}`)
// const docPath = computed(() => `${route.path}/en`);

// Pobranie dokumentu
const { data: doc } = await useAsyncData(() => {
  // Pobranie dokumentu z kolekcji na podstawie ścieżki
  return queryCollection('legal').path(docPath.value).first()
}

)

// Tytuły dla różnych typów dokumentów
const titles: Record<string, Record<string, string>> = {
  terms: {
    en: 'Terms and Conditions',
    pl: 'Warunki korzystania'
  },
  privacy: {
    en: 'Privacy Policy',
    pl: 'Polityka prywatności'
  },
  cookies: {
    en: 'Cookie Policy',
    pl: 'Polityka cookies'
  },
  gdpr: {
    en: 'GDPR Information',
    pl: 'Informacje o RODO'
  }
}

// Tytuł strony
useHead({
  title: titles[docType.value]?.[locale.value] || doc.value?.title || docType.value
  // title: titles[docType.value]?.[lang.value] || doc.value?.title || docType.value,
})

watch(() => lang.value, async () => {
  doc.value = await queryCollection('legal').path(`${route.path}/${lang.value}`).first()
})
</script>

<template>
  <NuxtLayout
    name="guest"
  >
    <UPage :ui="{ root: 'container mx-auto px-4 md:px-0 py-12 md:py-16' }">
      <!-- Menu  -->
      <div class="flex justify-between mt-8 py-4 border-b-2 border-gray-200 dark:border-gray-700">
        <!-- Przycisk powrotu -->
        <UButton
          icon="i-heroicons-arrow-left"
          color="primary"
          variant="ghost"
          @click="$router.back()"
        >
          Go back
        </UButton>

        <div>
          <!-- Select do zmiany jezyka -->
          <USelect
            v-model="lang"
            label="Language"
            :items="itemsSelected"
            class="mr-4"
          />
        </div>
      </div>

      <ContentRenderer
        v-if="doc"
        :value="doc"
      />

      <UAlert
        v-else
        type="warning"
        title="Document not found"
        description="The requested legal document is not available"
      />
    </UPage>
  </NuxtLayout>
</template>
