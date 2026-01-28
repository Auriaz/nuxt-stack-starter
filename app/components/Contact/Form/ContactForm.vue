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
        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-mail"
            class="mt-0.5 h-5 w-5 text-primary"
          />
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              E-mail
            </p>
            <p class="text-sm font-medium">
              kontakt@example.com
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <UIcon
            name="i-lucide-phone"
            class="mt-0.5 h-5 w-5 text-primary"
          />
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Telefon
            </p>
            <p class="text-sm font-medium">
              +48 600 000 000
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3 sm:col-span-2">
          <UIcon
            name="i-lucide-map-pin"
            class="mt-0.5 h-5 w-5 text-primary"
          />
          <div>
            <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Lokalizacja
            </p>
            <p class="text-sm font-medium">
              Zdalnie / Polska, strefa czasowa CET
            </p>
          </div>
        </div>
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
