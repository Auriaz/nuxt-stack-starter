<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { ContactFormSchema } from '#shared/schemas/api'
import type { ContactFormRequest } from '#shared/types/api'

definePageMeta({
  layout: 'default'
})

const title = 'Kontakt - Nuxt Base Starter'
const description
  = 'Skontaktuj się z nami. Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})

const schema = ContactFormSchema

const state = reactive<Partial<ContactFormRequest>>({
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
})

const isSubmitted = ref(false)
const submitError = ref<string | null>(null)
const toast = useToast()

async function onSubmit(event: FormSubmitEvent<ContactFormRequest>) {
  submitError.value = null
  isSubmitted.value = false

  try {
    const response = (await $fetch('/api/contact', {
      method: 'POST',
      body: event.data
    })) as { success: boolean, message?: string }

    if (response.success) {
      isSubmitted.value = true
      // Reset form
      Object.assign(state, {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
      toast.add({
        title: 'Sukces',
        description: 'Wiadomość została wysłana pomyślnie. Skontaktujemy się z Tobą wkrótce.',
        color: 'success'
      })
    } else {
      throw new Error(response.message || 'Wystąpił błąd podczas wysyłania formularza')
    }
  } catch (error) {
    if (error instanceof Error) {
      submitError.value = error.message
      toast.add({
        title: 'Błąd',
        description: error.message,
        color: 'error'
      })
    } else {
      submitError.value = 'Wystąpił błąd podczas wysyłania formularza'
      toast.add({
        title: 'Błąd',
        description: 'Wystąpił błąd podczas wysyłania formularza',
        color: 'error'
      })
    }
  }
}
</script>

<template>
  <NuxtLayout name="default">
    <!-- Page Header -->
    <section class="py-16 bg-muted/50">
      <UContainer>
        <div class="text-center max-w-3xl mx-auto">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
            <UIcon
              name="i-lucide-mail"
              class="w-8 h-8"
            />
          </div>
          <h1 class="text-4xl md:text-5xl font-bold mb-6">
            Skontaktuj się z nami
          </h1>
          <p class="text-lg text-muted">
            {{ description }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Contact Section -->
    <section class="py-20">
      <UContainer>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <!-- Contact Info -->
          <div class="lg:col-span-1">
            <div class="space-y-6">
              <div>
                <h2 class="text-2xl font-bold mb-6">
                  Informacje kontaktowe
                </h2>
                <p class="text-muted mb-6">
                  Jesteśmy dostępni od poniedziałku do piątku w godzinach 9:00-17:00. Odpowiemy na Twoją wiadomość w ciągu 24 godzin.
                </p>
              </div>

              <div class="space-y-4">
                <div class="flex items-start gap-4">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                    <UIcon
                      name="i-lucide-mail"
                      class="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:kontakt@example.com"
                      class="text-muted hover:text-primary transition-colors"
                    >
                      kontakt@example.com
                    </a>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                    <UIcon
                      name="i-lucide-phone"
                      class="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1">
                      Telefon
                    </h3>
                    <a
                      href="tel:+48123456789"
                      class="text-muted hover:text-primary transition-colors"
                    >
                      +48 123 456 789
                    </a>
                  </div>
                </div>

                <div class="flex items-start gap-4">
                  <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                    <UIcon
                      name="i-lucide-map-pin"
                      class="w-6 h-6"
                    />
                  </div>
                  <div>
                    <h3 class="font-semibold mb-1">
                      Adres
                    </h3>
                    <p class="text-muted">
                      ul. Przykładowa 123<br>
                      00-000 Warszawa<br>
                      Polska
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="lg:col-span-2">
            <!-- Success Message -->
            <UAlert
              v-if="isSubmitted"
              color="success"
              variant="soft"
              icon="i-lucide-check-circle"
              title="Wiadomość wysłana!"
              description="Dziękujemy za kontakt. Odpowiemy na Twoją wiadomość jak najszybciej."
              class="mb-6"
              :close-button="{ icon: 'i-lucide-x', color: 'primary', variant: 'link' }"
              @close="isSubmitted = false"
            />

            <!-- Error Message -->
            <UAlert
              v-if="submitError"
              color="error"
              variant="soft"
              icon="i-lucide-alert-circle"
              title="Błąd"
              :description="submitError"
              class="mb-6"
              :close-button="{ icon: 'i-lucide-x', color: 'primary', variant: 'link' }"
              @close="submitError = null"
            />

            <UCard>
              <template #header>
                <h2 class="text-xl font-bold">
                  Wyślij wiadomość
                </h2>
              </template>

              <UForm
                :schema="schema"
                :state="state"
                class="space-y-5 w-full"
                @submit="onSubmit"
              >
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <UFormField
                    label="Imię i nazwisko"
                    name="name"
                    required
                  >
                    <template #leading>
                      <UIcon
                        name="i-lucide-user"
                        class="w-5 h-5"
                      />
                    </template>
                    <UInput
                      v-model="state.name"
                      placeholder="Jan Kowalski"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Email"
                    name="email"
                    required
                  >
                    <template #leading>
                      <UIcon
                        name="i-lucide-mail"
                        class="w-5 h-5"
                      />
                    </template>
                    <UInput
                      v-model="state.email"
                      type="email"
                      placeholder="jan.kowalski@example.com"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <UFormField
                    label="Telefon (opcjonalnie)"
                    name="phone"
                  >
                    <template #leading>
                      <UIcon
                        name="i-lucide-phone"
                        class="w-5 h-5"
                      />
                    </template>
                    <UInput
                      v-model="state.phone"
                      type="tel"
                      placeholder="+48 123 456 789"
                      class="w-full"
                    />
                  </UFormField>

                  <UFormField
                    label="Temat"
                    name="subject"
                    required
                  >
                    <template #leading>
                      <UIcon
                        name="i-lucide-tag"
                        class="w-5 h-5"
                      />
                    </template>
                    <UInput
                      v-model="state.subject"
                      placeholder="Temat wiadomości"
                      class="w-full"
                    />
                  </UFormField>
                </div>

                <UFormField
                  label="Wiadomość"
                  name="message"
                  required
                >
                  <UTextarea
                    v-model="state.message"
                    placeholder="Twoja wiadomość..."
                    :rows="6"
                    class="resize-none w-full"
                  />
                </UFormField>

                <div class="flex flex-col sm:flex-row gap-4 pt-2">
                  <UButton
                    type="submit"
                    size="lg"
                    icon="i-lucide-send"
                    class="flex-1 w-full"
                  >
                    Wyślij wiadomość
                  </UButton>
                  <UButton
                    type="button"
                    variant="outline"
                    size="lg"
                    icon="i-lucide-rotate-ccw"
                    @click="
                      Object.assign(state, {
                        name: '',
                        email: '',
                        phone: '',
                        subject: '',
                        message: ''
                      })
                    "
                  >
                    Wyczyść
                  </UButton>
                </div>
              </UForm>
            </UCard>
          </div>
        </div>
      </UContainer>
    </section>
  </NuxtLayout>
</template>
