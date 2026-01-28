<script lang="ts" setup>
import { ResetPasswordInputSchema } from '#shared/schemas/auth'
import type { InferOutput } from 'valibot'
import type { AuthFormField } from '@nuxt/ui'

const route = useRoute()
const auth = useAuth()

// Użyj schematu z shared/schemas/auth.ts
// Uwaga: ResetPasswordInputSchema wymaga token z query string
const form = useForm(ResetPasswordInputSchema)

// Pobierz token z query string
const token = computed(() => (route.query.token as string) || '')
const email = computed(() => (route.query.email as string) || '')

// Ustaw domyślne wartości jeśli są w query (w onMounted)
onMounted(() => {
  if (email.value || token.value) {
    form.setValues({
      email: email.value || undefined,
      token: token.value || undefined
    } as Partial<InferOutput<typeof ResetPasswordInputSchema>>)
  }
})

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
    label: 'Nowe hasło',
    type: 'password',
    placeholder: '••••••••',
    required: true
  }
]

async function onSubmit(values: InferOutput<typeof ResetPasswordInputSchema>) {
  if (!token.value) {
    const toast = useToast()
    toast.add({
      title: 'Błąd',
      description: 'Brak tokenu resetu hasła. Sprawdź link w emailu.',
      color: 'error'
    })
    return
  }

  try {
    // useAuth.resetPassword() obsługuje toast i redirect
    // Token jest w query, więc przekazujemy go osobno
    await auth.resetPassword({
      ...values,
      token: token.value
    })
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
      :schema="ResetPasswordInputSchema"
      :fields="fields"
      title="Resetuj hasło"
      description="Wprowadź nowe hasło dla swojego konta"
      icon="i-lucide-key-round"
      :submit="{
        label: 'Zresetuj hasło',
        block: true,
        class: 'glass-button-primary',
        loading: form.pending.value || auth.isLoading.value
      }"
      @submit="form.handleSubmit(onSubmit)"
    >
      <template
        v-if="!token"
        #error
      >
        <UAlert
          color="error"
          variant="soft"
          title="Brak tokenu"
          description="Link resetu hasła jest nieprawidłowy lub wygasł. Poproś o nowy link."
        />
      </template>
      <template
        v-else-if="form.formError.value"
        #error
      >
        <UAlert
          color="error"
          variant="soft"
          :title="form.formError.value"
        />
      </template>
    </UAuthForm>
  </UPageCard>
</template>
