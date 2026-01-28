<script lang="ts" setup>
import { ForgotPasswordInputSchema } from '#shared/schemas/auth'
import type { InferOutput } from 'valibot'
import type { AuthFormField } from '@nuxt/ui'

const emit = defineEmits<{
  switchToLogin: []
}>()

const auth = useAuth()

// Użyj schematu z shared/schemas/auth.ts
const form = useForm(ForgotPasswordInputSchema)

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
    // useAuth.forgotPassword() obsługuje toast i redirect
    await auth.forgotPassword(values)
  } catch (error) {
    form.setErrorsFromApi(error)
    throw error // Re-throw dla useAuth (obsługuje toast)
  }
}
</script>

<template>
  <UPageCard
    variant="ghost"
    class="w-full glass-panel cockpit-panel relative overflow-hidden border border-slate-200/80 dark:border-slate-700/80 rounded-lg shadow-xl shadow-black"
  >
    <!-- HUD Corner Indicators -->
    <div class="cockpit-hud-corners" />
    <UAuthForm
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
      @submit="form.handleSubmit(onSubmit)"
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
