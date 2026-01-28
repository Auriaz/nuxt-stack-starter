<script lang="ts" setup>
import { ForgotPasswordInputSchema } from '#shared/schemas/auth'
import type { InferOutput } from 'valibot'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { ref } from 'vue'
import { useAuthResource } from '~/composables/resources/useAuthResource'

const emit = defineEmits<{
  switchToLogin: []
}>()

const auth = useAuth()
const authResource = useAuthResource()

// Użyj schematu z shared/schemas/auth.ts
const form = useForm(ForgotPasswordInputSchema)
const isSuccess = ref(false)

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'twoj@email.pl',
    required: true,
    description: 'Wprowadź adres email powiązany z Twoim kontem. Wyślemy Ci link do resetowania hasła.'
  }
]

async function onSubmit(values: InferOutput<typeof ForgotPasswordInputSchema>) {
  try {
    // Wywołaj bezpośrednio resource (bez redirect z useAuth)
    await authResource.forgotPassword(values)
    isSuccess.value = true
  } catch (error) {
    form.setErrorsFromApi(error)
    throw error
  }
}

// Wrapper dla @submit event (wymagany przez UAuthForm)
function handleSubmitEvent(
  event: FormSubmitEvent<InferOutput<typeof ForgotPasswordInputSchema>>
): void {
  form.handleSubmit(onSubmit)(event)
}
</script>

<template>
  <UPageCard
    variant="ghost"
    class="w-full glass-panel cockpit-panel relative overflow-hidden border border-slate-200/80 dark:border-slate-700/80 rounded-lg shadow-xl shadow-black"
  >
    <!-- HUD Corner Indicators -->
    <div class="cockpit-hud-corners" />
    <!-- Komunikat sukcesu -->
    <div
      v-if="isSuccess"
      class="space-y-4"
    >
      <div>
        <h1 class="text-xl font-semibold">
          Email wysłany
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400">
          Jeśli konto istnieje, wysłaliśmy link resetu hasła na podany adres e-mail.
        </p>
      </div>
      <UAlert
        color="success"
        variant="soft"
        title="Sprawdź swoją skrzynkę pocztową"
        description="Jeśli konto istnieje i nie zostało jeszcze zweryfikowane, wysłaliśmy link resetu hasła. Link jest ważny przez 60 minut."
      />
      <div class="text-center">
        <UButton
          color="primary"
          variant="outline"
          @click="emit('switchToLogin')"
        >
          Powrót do logowania
        </UButton>
      </div>
    </div>

    <!-- Formularz -->
    <UAuthForm
      v-else
      :schema="ForgotPasswordInputSchema"
      :fields="fields"
      title="Resetuj hasło"
      description="Wprowadź adres email, a wyślemy Ci link do resetowania hasła"
      icon="i-lucide-key-round"
      :submit="{
        label: 'Wyślij link resetujący',
        block: true,
        class: 'glass-button-primary',
        loading: form.pending.value || auth.isLoading.value
      }"
      @submit="handleSubmitEvent"
    >
      <template
        v-if="form.formError.value"
        #error
      >
        <UAlert
          color="error"
          variant="soft"
          :title="form.formError.value"
        />
      </template>

      <template #footer>
        <div class="text-center text-sm text-slate-600 dark:text-slate-400">
          Pamiętasz hasło?
          <button
            type="button"
            class="text-primary hover:underline font-medium"
            @click="emit('switchToLogin')"
          >
            Zaloguj się
          </button>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
