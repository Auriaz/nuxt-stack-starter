<script setup lang="ts">
import { ref } from 'vue'
import type { ContactFormInput } from '#shared/types/api'
import { useContactResource } from '~/composables/resources/useContactResource'

const contactResource = useContactResource()

const form = ref<ContactFormInput>({
  name: '',
  email: '',
  message: '',
  honeypot: ''
})

const pending = ref(false)
const success = ref(false)
const errorMessage = ref<string | null>(null)
const contactCards = [
  {
    title: 'Email',
    description: 'kontakt@example.com',
    icon: 'i-lucide-mail',
    to: 'mailto:kontakt@example.com'
  },
  {
    title: 'Telefon',
    description: '+48 600 000 000',
    icon: 'i-lucide-phone',
    to: 'tel:+48600000000'
  },
  {
    title: 'Godziny',
    description: 'Pn–Pt 9:00–17:00',
    icon: 'i-lucide-clock'
  },
  {
    title: 'Lokalizacja',
    description: 'Polska / CET',
    icon: 'i-lucide-map-pin'
  }
]

async function onSubmit() {
  if (pending.value) return

  pending.value = true
  errorMessage.value = null

  try {
    await contactResource.sendContact(form.value)
    success.value = true
    // Opcjonalnie wyczyść formularz (poza honeypot)
    form.value.name = ''
    form.value.email = ''
    form.value.message = ''
  } catch (error) {
    // Spróbuj wyciągnąć message z kontraktu API
    const apiError = (error as { data?: { error?: { message: string } } }).data?.error
    errorMessage.value
      = apiError?.message || 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <section class="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] items-start">
    <!-- Kolumna informacyjna -->
    <div class="space-y-6">
      <div>
        <p class="text-sm uppercase tracking-[0.25em] text-primary mb-2">
          Kontakt
        </p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">
          Porozmawiajmy o&nbsp;
          <span class="bg-linear-to-r from-primary to-sky-500 bg-clip-text text-transparent">
            Twoim projekcie
          </span>
        </h2>
      </div>

      <p class="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-xl">
        Opowiedz krótko, czego potrzebujesz – wrócimy z propozycją dalszych kroków,
        terminem i wyceną. Odpowiadamy zazwyczaj w&nbsp;ciągu jednego dnia roboczego.
      </p>

      <div class="grid gap-4 sm:grid-cols-2">
        <component
          :is="card.to ? 'NuxtLink' : 'div'"
          v-for="(card, index) in contactCards"
          :key="`${card.title}-${index}`"
          :to="card.to || undefined"
          class="group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900/60"
        >
          <div class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div class="absolute -top-16 right-0 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div class="absolute bottom-0 left-0 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          </div>

          <div class="relative z-10 flex items-start gap-4">
            <div
              class="flex h-11 w-11 items-center justify-center rounded-2xl border shadow-sm transition-colors duration-300"
              :class="[
                index % 6 === 0 && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
                index % 6 === 1 && 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
                index % 6 === 2 && 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300',
                index % 6 === 3 && 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
                index % 6 === 4 && 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
                index % 6 === 5 && 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-300'
              ]"
            >
              <UIcon
                v-if="card.icon"
                :name="card.icon"
                class="h-5 w-5"
              />
              <span
                v-else
                class="text-xs font-semibold"
              >
                {{ index + 1 }}
              </span>
            </div>

            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                {{ card.title }}
              </p>
              <p class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ card.description }}
              </p>
            </div>
          </div>
        </component>
      </div>
    </div>

    <!-- Kolumna z formularzem -->
    <UCard
      class="border border-gray-200/70 bg-white/80 shadow-sm backdrop-blur-sm dark:bg-gray-900/60 dark:border-gray-800"
      :ui="{
        body: 'p-6 md:p-7 space-y-5'
      }"
    >
      <div class="space-y-1">
        <h3 class="text-lg font-semibold">
          Wyślij wiadomość
        </h3>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Formularz trafia bezpośrednio na naszą skrzynkę – nie zapisujemy tutaj żadnych danych marketingowych.
        </p>
      </div>

      <form
        class="space-y-4"
        @submit.prevent="onSubmit"
      >
        <div class="space-y-1">
          <label
            for="contact-name"
            class="block text-sm font-medium"
          >
            Imię i nazwisko
          </label>
          <UInput
            id="contact-name"
            v-model="form.name"
            type="text"
            required
            placeholder="Jan Kowalski"
            class="w-full"
          />
        </div>

        <div class="space-y-1">
          <label
            for="contact-email"
            class="block text-sm font-medium"
          >
            E-mail
          </label>
          <UInput
            id="contact-email"
            v-model="form.email"
            type="email"
            required
            placeholder="jan.kowalski@example.com"
            class="w-full"
          />
        </div>

        <div class="space-y-1">
          <label
            for="contact-message"
            class="block text-sm font-medium"
          >
            Wiadomość
          </label>
          <UTextarea
            id="contact-message"
            v-model="form.message"
            required
            :rows="5"
            placeholder="Opisz w kilku zdaniach, nad czym chcesz pracować."
            class="w-full"
          />
        </div>

        <!-- Honeypot (ukryte pole dla botów) -->
        <div class="hidden">
          <label
            for="contact-company"
            class="block text-sm font-medium"
          >
            Firma
          </label>
          <input
            id="contact-company"
            v-model="form.honeypot"
            type="text"
            autocomplete="off"
            tabindex="-1"
            class="w-full"
          >
        </div>

        <div class="space-y-3 pt-2">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="pending"
          >
            Wyślij wiadomość
          </UButton>

          <UAlert
            v-if="success"
            color="success"
            variant="soft"
            title="Wiadomość została wysłana"
            description="Dziękujemy za kontakt – odezwiemy się tak szybko, jak to możliwe."
          />

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            title="Nie udało się wysłać wiadomości"
            :description="errorMessage"
          />
        </div>
      </form>
    </UCard>
  </section>
</template>
