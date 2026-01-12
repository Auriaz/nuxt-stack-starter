<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const title = 'O nas - Nuxt Base Starter'
const description
  = 'Poznaj naszą historię, wartości i zespół. Tworzymy nowoczesne rozwiązania webowe z pasją i zaangażowaniem.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})
</script>

<template>
  <NuxtLayout name="default">
    <!-- Page Header -->
    <section class="py-16 bg-muted/50">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            O nas
          </h1>
          <p class="text-lg text-muted">
            {{ description }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- About Content -->
    <section class="py-20">
      <UContainer>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 class="text-3xl font-bold mb-6">
              Nasza misja
            </h2>
            <p class="text-lg text-muted mb-4">
              Tworzymy nowoczesne rozwiązania webowe, które pomagają firmom osiągać swoje cele
              biznesowe. Wierzymy w prostotę, jakość i ciągłe doskonalenie.
            </p>
            <p class="text-lg text-muted">
              Nasz starter Nuxt Base Starter to efekt lat doświadczenia w tworzeniu aplikacji
              webowych. Zawiera wszystko, czego potrzebujesz, aby szybko rozpocząć profesjonalny
              projekt.
            </p>
          </div>
          <div
            class="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
          >
            <UIcon
              name="i-lucide-users"
              class="w-32 h-32 text-white opacity-50"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="p-4 rounded-lg bg-primary/10 text-primary inline-block mb-4">
              <UIcon
                name="i-lucide-target"
                class="w-8 h-8"
              />
            </div>
            <h3 class="text-xl font-semibold mb-2">
              Skupienie na jakości
            </h3>
            <p class="text-muted">
              Każdy projekt realizujemy z dbałością o szczegóły i najwyższą jakość kodu.
            </p>
          </div>

          <div class="text-center">
            <div class="p-4 rounded-lg bg-primary/10 text-primary inline-block mb-4">
              <UIcon
                name="i-lucide-lightbulb"
                class="w-8 h-8"
              />
            </div>
            <h3 class="text-xl font-semibold mb-2">
              Innowacyjność
            </h3>
            <p class="text-muted">
              Wykorzystujemy najnowsze technologie i najlepsze praktyki w branży.
            </p>
          </div>

          <div class="text-center">
            <div class="p-4 rounded-lg bg-primary/10 text-primary inline-block mb-4">
              <UIcon
                name="i-lucide-heart"
                class="w-8 h-8"
              />
            </div>
            <h3 class="text-xl font-semibold mb-2">
              Pasja
            </h3>
            <p class="text-muted">
              Kochamy to, co robimy i dzielimy się naszą wiedzą z innymi.
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- CTA Section -->
    <UiCTA
      title="Chcesz z nami współpracować?"
      description="Skontaktuj się z nami i dowiedz się, jak możemy pomóc w realizacji Twojego projektu."
      primary-text="Skontaktuj się"
      primary-to="/kontakt"
    />
  </NuxtLayout>
</template>
