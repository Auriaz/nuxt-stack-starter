<script setup lang="ts">
  import type { FormSubmitEvent } from '@nuxt/ui'
  import { ContactFormSchema } from '#shared/schemas/api'
  import type { ContactFormRequest } from '#shared/types/api'

  definePageMeta({
    layout: 'default',
  })

  const title = 'Kontakt - Nuxt Base Starter'
  const description =
    'Skontaktuj się z nami. Chętnie odpowiemy na Twoje pytania i pomożemy w realizacji Twojego projektu.'

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
  })

  const schema = ContactFormSchema

  const state = reactive<Partial<ContactFormRequest>>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
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
        body: event.data,
      })) as { success: boolean; message?: string }

      if (response.success) {
        isSubmitted.value = true
        // Reset form
        Object.assign(state, {
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        })
        toast.add({
          title: 'Sukces',
          description: 'Wiadomość została wysłana pomyślnie. Skontaktujemy się z Tobą wkrótce.',
          color: 'success',
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
          color: 'error',
        })
      } else {
        submitError.value = 'Wystąpił błąd podczas wysyłania formularza'
        toast.add({
          title: 'Błąd',
          description: 'Wystąpił błąd podczas wysyłania formularza',
          color: 'error',
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
          <h1 class="text-4xl md:text-5xl font-bold mb-6">Skontaktuj się z nami</h1>
          <p class="text-lg text-muted">
            {{ description }}
          </p>
        </div>
      </UContainer>
    </section>

    <!-- Contact Form -->
    <section class="py-20">
      <UContainer>
        <div class="max-w-2xl mx-auto">
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
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
              <UFormField label="Imię i nazwisko" name="name" required>
                <UInput v-model="state.name" placeholder="Jan Kowalski" />
              </UFormField>

              <UFormField label="Email" name="email" required>
                <UInput v-model="state.email" type="email" placeholder="jan.kowalski@example.com" />
              </UFormField>

              <UFormField label="Telefon (opcjonalnie)" name="phone">
                <UInput v-model="state.phone" type="tel" placeholder="+48 123 456 789" />
              </UFormField>

              <UFormField label="Temat" name="subject" required>
                <UInput v-model="state.subject" placeholder="Temat wiadomości" />
              </UFormField>

              <UFormField label="Wiadomość" name="message" required>
                <UTextarea v-model="state.message" placeholder="Twoja wiadomość..." :rows="6" />
              </UFormField>

              <div class="flex gap-4">
                <UButton type="submit" size="lg"> Wyślij wiadomość </UButton>
                <UButton
                  type="button"
                  variant="outline"
                  size="lg"
                  @click="
                    Object.assign(state, {
                      name: '',
                      email: '',
                      phone: '',
                      subject: '',
                      message: '',
                    })
                  "
                >
                  Wyczyść
                </UButton>
              </div>
            </UForm>
          </UCard>
        </div>
      </UContainer>
    </section>
  </NuxtLayout>
</template>
