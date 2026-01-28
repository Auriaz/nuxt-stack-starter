<script lang="ts" setup>
import { RegisterFormSchema } from '#shared/schemas/auth'
import type { InferOutput } from 'valibot'
import type { AuthFormField, ButtonProps, FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{
  switchToLogin: []
}>()

const auth = useAuth()

// Użyj RegisterFormSchema z passwordConfirm (dla UI)
// Schemat używa looseObject, więc pozwala na dodatkowe pola
const form = useForm(RegisterFormSchema)

// Fields dla UAuthForm
// Uwaga: passwordConfirm i terms są tylko dla UI - nie są wysyłane do API
const fields: AuthFormField[] = [
  {
    name: 'username',
    type: 'text',
    label: 'Nazwa użytkownika',
    placeholder: 'jan_kowalski',
    required: true
  },
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'twoj@email.pl',
    required: true
  },
  {
    name: 'password',
    label: 'Hasło',
    type: 'password',
    placeholder: '••••••••',
    required: true
  },
  {
    name: 'passwordConfirm',
    label: 'Potwierdź hasło',
    type: 'password',
    placeholder: '••••••••',
    required: true
  }
]

const providers: ButtonProps[] = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    color: 'neutral',
    variant: 'subtle',
    block: true,
    onClick: () => {
      const toast = useToast()
      toast.add({ title: 'Google', description: 'Rejestracja przez Google' })
    }
  },
  {
    label: 'GitHub',
    icon: 'i-simple-icons-github',
    color: 'neutral',
    variant: 'subtle',
    block: true,
    onClick: () => {
      const toast = useToast()
      toast.add({ title: 'GitHub', description: 'Rejestracja przez GitHub' })
    }
  }
]

async function onSubmit(values: InferOutput<typeof RegisterFormSchema>) {
  // Walidacja passwordConfirm
  const passwordConfirm = values.passwordConfirm

  if (passwordConfirm !== values.password) {
    // Ustaw błąd i rzuć wyjątek, żeby zatrzymać submit
    form.errors.value.passwordConfirm = 'Hasła nie są identyczne'
    // Rzuć błąd, który zatrzyma submit (handleSubmit złapie to w catch)
    const validationError = new Error('Password confirmation failed') as Error & {
      preserveErrors?: boolean
      passwordConfirmError?: string
    }
    validationError.preserveErrors = true
    validationError.passwordConfirmError = 'Hasła nie są identyczne'
    throw validationError
  }

  // Wyczyść błąd passwordConfirm jeśli hasła się zgadzają
  if (form.errors.value.passwordConfirm) {
    delete form.errors.value.passwordConfirm
  }

  try {
    // useAuth.register() obsługuje redirect i toast
    // Backend otrzymuje tylko: username, email, password (bez passwordConfirm)
    await auth.register({
      username: values.username,
      email: values.email,
      password: values.password
    })
  } catch (error) {
    form.setErrorsFromApi(error)
    throw error // Re-throw dla useAuth (obsługuje toast)
  }
}

// Wrapper dla @submit event
function handleSubmitEvent(event: FormSubmitEvent<InferOutput<typeof RegisterFormSchema>>) {
  form.handleSubmit(onSubmit)(event)
}
</script>

<template>
  <UPageCard
    variant="ghost"
    class="w-full glass-panel cockpit-panel relative overflow-hidden"
  >
    <!-- HUD Corner Indicators -->
    <div class="cockpit-hud-corners" />
    <UAuthForm
      :schema="RegisterFormSchema"
      :fields="fields"
      :providers="providers"
      :errors="Object.entries(form.errors.value).map(([name, message]) => ({ name, message }))"
      title="Utwórz konto"
      description="Zarejestruj się, aby rozpocząć korzystanie z naszych usług"
      icon="i-lucide-user-plus"
      separator="lub"
      :submit="{
        label: 'Utwórz konto',
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
          Masz już konto?
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
