<script lang="ts" setup>
import { LoginInputSchema } from '#shared/schemas/auth'
import type { InferOutput } from 'valibot'
import type { AuthFormField, ButtonProps, FormSubmitEvent } from '@nuxt/ui'

const emit = defineEmits<{
  switchToRegister: []
  switchToForgotPassword: []
}>()

const auth = useAuth()

// Użyj schematu z shared/schemas/auth.ts
const form = useForm(LoginInputSchema)

const fields: AuthFormField[] = [
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
    name: 'remember',
    label: 'Zapamiętaj mnie',
    type: 'checkbox'
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
      toast.add({ title: 'Google', description: 'Logowanie przez Google' })
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
      toast.add({ title: 'GitHub', description: 'Logowanie przez GitHub' })
    }
  }
]

async function onSubmit(values: InferOutput<typeof LoginInputSchema>) {
  // auth.login() rzuca błąd, który jest obsługiwany w handleSubmit przez setErrorsFromApi
  // Toast jest wyświetlany w useAuth.login()
  await auth.login(values)
}

// Wrapper dla @submit event
function handleSubmitEvent(event: FormSubmitEvent<InferOutput<typeof LoginInputSchema>>): void {
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
    <!-- Alert dla błędów API (poza UAuthForm) -->
    <UAlert
      v-if="form.formError.value"
      color="error"
      variant="soft"
      :title="form.formError.value"
      class="mb-4"
    />

    <UAuthForm
      :schema="LoginInputSchema"
      :fields="fields"
      :providers="providers"
      title="Zaloguj się"
      description="Wprowadź swoje dane, aby uzyskać dostęp do konta"
      icon="i-lucide-lock"
      separator="lub"
      :submit="{
        label: 'Zaloguj się',
        block: true,
        class: 'glass-button-primary',
        loading: form.pending.value || auth.isLoading.value
      }"
      @submit="handleSubmitEvent"
    >
      <template #password-hint>
        <button
          type="button"
          class="text-primary hover:underline font-medium text-sm"
          tabindex="-1"
          @click="emit('switchToForgotPassword')"
        >
          Zapomniałeś hasła?
        </button>
      </template>

      <template #footer>
        <div class="text-center text-sm text-slate-600 dark:text-slate-400">
          Nie masz konta?
          <button
            type="button"
            class="text-primary hover:underline font-medium"
            @click="emit('switchToRegister')"
          >
            Zarejestruj się
          </button>
        </div>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
