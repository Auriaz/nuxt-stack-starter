<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { SectionContactForm, SectionBase } from '#shared/types/sections'
import { ContactFormSchema } from '#shared/schemas/api'
import type { ContactFormRequest } from '#shared/types/api'

interface Props {
  section: SectionContactForm
  base: SectionBase
  props: SectionContactForm['props']
}

const props = defineProps<Props>()

const config = computed(() => ({
  title: props.base.title,
  description: props.base.description,
  endpoint: props.props?.endpoint || '/api/contact',
  method: props.props?.method || 'POST',
  fields: props.props?.fields || [],
  consent: props.props?.consent,
  successMessage: props.props?.successMessage || 'Wiadomość została wysłana pomyślnie. Skontaktujemy się z Tobą wkrótce.',
  errorMessage: props.props?.errorMessage || 'Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.',
  spamProtection: props.props?.spamProtection,
  align: props.base.align || 'left'
}))

// Form state - dynamiczny na podstawie fields
const state = reactive<Record<string, string>>({})
const consentChecked = ref(false)

// Inicjalizacja state z fields
watch(() => config.value.fields, (fields) => {
  fields.forEach((field) => {
    if (!(field.name in state)) {
      state[field.name] = ''
    }
  })
}, { immediate: true })

// Composable do obsługi formularza
const { isSubmitting, isSubmitted, submitError, submit, reset } = useContactForm({
  endpoint: config.value.endpoint,
  method: config.value.method
})

// Schema walidacji - używamy ContactFormSchema dla pól zgodnych z API
// UForm automatycznie waliduje tylko pola zdefiniowane w schema
const schema = ContactFormSchema

// Reset formularza po sukcesie
watch(isSubmitted, (submitted) => {
  if (submitted) {
    Object.keys(state).forEach((key) => {
      state[key] = ''
    })
    consentChecked.value = false
    // Reset po 3 sekundach
    setTimeout(() => {
      reset()
    }, 3000)
  }
})

const resetForm = () => {
  Object.keys(state).forEach((key) => {
    state[key] = ''
  })
  consentChecked.value = false
}

async function onSubmit(event: FormSubmitEvent<ContactFormRequest>) {
  // Sprawdź consent jeśli wymagany
  if (config.value.consent?.required && !consentChecked.value) {
    return
  }

  // Honeypot check (jeśli włączony)
  if (config.value.spamProtection?.type === 'honeypot') {
    // Honeypot field powinien być ukryty w template
    // Jeśli wypełniony, to bot - nie wysyłaj
    const honeypotValue = state['_honeypot'] || ''
    if (honeypotValue) {
      return
    }
  }

  await submit(event.data)
}

const headerClasses = computed(() => ({
  'text-center': config.value.align === 'center',
  'text-left': config.value.align === 'left'
}))
</script>

<template>
  <div>
    <div
      v-if="config.title || config.description"
      :class="['mb-8', headerClasses]"
    >
      <h2
        v-if="config.title"
        class="text-3xl md:text-4xl font-bold mb-4"
      >
        {{ config.title }}
      </h2>
      <p
        v-if="config.description"
        class="text-lg text-muted max-w-2xl"
        :class="config.align === 'center' ? 'mx-auto' : ''"
      >
        {{ config.description }}
      </p>
    </div>

    <!-- Success Message -->
    <UAlert
      v-if="isSubmitted"
      color="success"
      variant="soft"
      icon="i-lucide-check-circle"
      title="Wiadomość wysłana!"
      :description="config.successMessage"
      class="mb-6"
      :close-button="{ icon: 'i-lucide-x', color: 'primary', variant: 'link' }"
      @close="reset"
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
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-5 w-full"
        @submit="onSubmit"
      >
        <div
          v-if="config.fields.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          <UFormField
            v-for="field in config.fields"
            :key="field.name"
            :label="field.label"
            :name="field.name"
            :required="field.required"
          >
            <template
              v-if="field.icon"
              #leading
            >
              <UIcon
                :name="field.icon"
                class="w-5 h-5"
              />
            </template>
            <UInput
              v-if="field.type !== 'textarea'"
              :model-value="state[field.name]"
              :type="field.type || 'text'"
              :placeholder="field.placeholder"
              class="w-full"
              @update:model-value="state[field.name] = $event"
            />
            <UTextarea
              v-else
              :model-value="state[field.name]"
              :placeholder="field.placeholder"
              :rows="6"
              class="resize-none w-full"
              @update:model-value="state[field.name] = $event"
            />
          </UFormField>
        </div>

        <!-- Honeypot field (ukryty) -->
        <input
          v-if="config.spamProtection?.type === 'honeypot'"
          v-model="state._honeypot"
          type="text"
          name="_honeypot"
          class="hidden"
          tabindex="-1"
          autocomplete="off"
        >

        <!-- Consent checkbox -->
        <UFormField
          v-if="config.consent"
          :name="'consent'"
          :required="config.consent.required"
        >
          <UCheckbox
            v-model="consentChecked"
            :label="config.consent.label"
          />
        </UFormField>

        <div class="flex flex-col sm:flex-row gap-4 pt-2">
          <UButton
            type="submit"
            size="lg"
            icon="i-lucide-send"
            :loading="isSubmitting"
            :disabled="isSubmitting"
            class="flex-1 w-full"
          >
            Wyślij wiadomość
          </UButton>
          <UButton
            type="button"
            variant="outline"
            size="lg"
            icon="i-lucide-rotate-ccw"
            @click="resetForm"
          >
            Wyczyść
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
