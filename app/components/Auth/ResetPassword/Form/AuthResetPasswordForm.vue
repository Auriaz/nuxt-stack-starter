<script lang="ts" setup>
import { object, string, minLength, pipe, forward, partialCheck, type InferOutput } from 'valibot'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

const route = useRoute()
const auth = useAuth()
const router = useRouter()

// Schemat formularza (tylko pola wpisywane przez użytkownika)
// Token pochodzi z query param i NIE jest częścią schematu formularza.
const ResetPasswordFormSchema = pipe(
  object({
    password: pipe(string(), minLength(8, 'Hasło musi mieć co najmniej 8 znaków')),
    passwordConfirm: pipe(string(), minLength(1, 'Potwierdzenie hasła jest wymagane'))
  }),
  // Walidacja zgodności haseł na poziomie schematu (Valibot + Nuxt UI)
  forward(
    partialCheck(
      [['password'], ['passwordConfirm']],
      input => input.password === input.passwordConfirm,
      'Hasła nie są identyczne'
    ),
    ['passwordConfirm']
  )
)

// Użyj lokalnego schematu formularza dla UAuthForm + useForm
const form = useForm(ResetPasswordFormSchema)

// Pobierz token z query string
const token = computed(() => (route.query.token as string) || '')

const fields: AuthFormField[] = [
  {
    name: 'password',
    label: 'Nowe hasło',
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

async function onSubmit(values: InferOutput<typeof ResetPasswordFormSchema>) {
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
    await auth.resetPassword({
      token: token.value,
      password: values.password,
      passwordConfirm: values.passwordConfirm
    })
    // Po sukcesie redirect do dashboard (sesja jest już ustawiona przez endpoint)
    await router.push('/dashboard')
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any
    const code = err.data?.error?.code ?? err.data?.data?.error?.code ?? err.error?.code

    // Obsługa błędów tokenu z odpowiednimi komunikatami UX
    if (code === 'TOKEN_EXPIRED') {
      form.formError.value = 'Link resetu hasła wygasł. Poproś o nowy link.'
    } else if (code === 'TOKEN_ALREADY_USED') {
      form.formError.value = 'Link resetu hasła został już użyty. Poproś o nowy link.'
    } else if (code === 'TOKEN_INVALID') {
      form.formError.value = 'Link resetu hasła jest nieprawidłowy. Sprawdź link w emailu.'
    } else {
      form.setErrorsFromApi(error)
    }
    throw error // Re-throw dla useAuth (obsługuje toast)
  }
}

// Wrapper dla @submit event z UAuthForm
// UAuthForm sam wykonuje walidację wg lokalnego schematu formularza.
function handleSubmitEvent(
  event: FormSubmitEvent<InferOutput<typeof ResetPasswordFormSchema>>
): void {
  void onSubmit(event.data)
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
      :schema="ResetPasswordFormSchema"
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
      @submit="handleSubmitEvent"
    />

    <UAlert
      v-if="!token"
      color="error"
      variant="soft"
      title="Brak tokenu"
      description="Link resetu hasła jest nieprawidłowy lub wygasł. Poproś o nowy link."
    />

    <UAlert
      v-else-if="form.formError.value"
      color="error"
      variant="soft"
      :title="form.formError.value"
    />
  </UPageCard>
</template>
