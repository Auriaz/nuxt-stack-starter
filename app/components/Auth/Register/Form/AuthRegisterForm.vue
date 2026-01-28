<script lang="ts" setup>
import { RegisterFormSchema } from '#shared/schemas/auth'
import type { InferOutput } from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'
import { useAuthResource } from '~/composables/resources/useAuthResource'

const emit = defineEmits<{
  switchToLogin: []
}>()

const { register } = useAuthResource()
const isRegistered = ref(false)

// Flaga zgody – trzymana lokalnie
const isAgreedToTerms = ref(false)
const isOpenAgreementModel = ref(false)
const lang = ref('pl')
const itemsSelected = ref([
  {
    label: 'Polski',
    value: 'pl'
  },
  {
    label: 'Angielski',
    value: 'en'
  }
])
// Użyj RegisterFormSchema z passwordConfirm (dla UI)
// Schemat używa looseObject, więc pozwala na dodatkowe pola
const form = useForm(RegisterFormSchema)

// Lokalny stan formularza dla UForm (powiązany z RegisterFormSchema)
const registerForm = reactive({
  data: {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    isAgreedToTerms: false
  },
  loading: false
})

const canSeeThePassword = ref(false)
const canSeeTheConfirmPassword = ref(false)

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

  // Walidacja zgody na warunki
  if (!isAgreedToTerms.value) {
    form.formError.value = 'Rejestracja wymaga zaakceptowania warunków serwisu.'
    return
  }

  try {
    // Rejestracja przez warstwę resources (bez natychmiastowego logowania)
    // Backend otrzymuje tylko: username, email, password (bez passwordConfirm)
    await register({
      username: values.username,
      email: values.email,
      password: values.password
    })

    isRegistered.value = true
    form.formError.value = null
  } catch (error: unknown) {
    const err = error as {
      data?: {
        error?: { code?: string }
        data?: { error?: { code?: string } }
      }
      error?: { code?: string }
    }

    const code
      = err.data?.error?.code
        ?? err.data?.data?.error?.code
        ?? err.error?.code

    if (code === 'EMAIL_ALREADY_EXISTS') {
      // Czytelny błąd przy duplikacie e-maila
      form.errors.value.email = 'Użytkownik z tym adresem e-mail już istnieje'
      form.formError.value = 'Nie można utworzyć konta – ten adres e-mail jest już zajęty.'
      return
    }

    form.setErrorsFromApi(error)
    throw error
  }
}

function agreement(value: boolean) {
  isAgreedToTerms.value = value
  isOpenAgreementModel.value = false
}

const { data: terms } = useAsyncData('register-terms', () =>
  queryCollection('legal').path(`/legal/terms/${lang.value}`).first()
)

watch(
  () => lang.value,
  () => {
    useAsyncData('register-terms', () =>
      queryCollection('legal').path(`/legal/terms/${lang.value}`).first()
    )
  }
)

// Wrapper dla @submit event z UForm
async function onSubmitRegister(event: FormSubmitEvent<InferOutput<typeof RegisterFormSchema>>) {
  registerForm.loading = true
  try {
    await onSubmit(event.data)
  } finally {
    registerForm.loading = false
  }
}
</script>

<template>
  <UPageCard
    variant="ghost"
    class="w-full glass-panel cockpit-panel relative overflow-hidden overflow-hidden border border-slate-200/80 dark:border-slate-700/80 rounded-lg shadow-xl shadow-black"
  >
    <div class="cockpit-hud-corners" />
    <template #header>
      <div class="flex flex-col gap-4 items-center">
        <UIcon
          name="i-lucide-user-plus"
          class="text-gray-700 dark:text-gray-200 text-4xl"
        />
        <h2 class="text-2xl font-semibold">
          Zarejestruj się
        </h2>

        <p class="text-md text-slate-600 dark:text-slate-400 text-center">
          Wprowadź swoje dane, aby utworzyć konto i zacząć korzystać z naszych usług.
        </p>
      </div>
    </template>
    <USeparator class="mb-4 px-6" />

    <div v-if="!isRegistered">
      <UForm
        :schema="RegisterFormSchema"
        :state="registerForm.data"
        class="w-full space-y-6 px-6 overflow-y-auto"
        @submit="onSubmitRegister"
      >
        <UFormField
          required
          label="Username"
          name="username"
          class="w-full"
        >
          <UInput
            v-model="registerForm.data.username"
            class="w-full"
          />
        </UFormField>

        <UFormField
          required
          label="Email"
          name="email"
          class="w-full"
        >
          <UInput
            v-model="registerForm.data.email"
            class="w-full"
          />
        </UFormField>

        <UFormField
          required
          class="w-full relative"
          label="Password"
          name="password"
        >
          <UInput
            v-model="registerForm.data.password"
            :type="canSeeThePassword ? 'text' : 'password'"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="secondary"
                size="sm"
                variant="link"
                :icon="canSeeThePassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="canSeeThePassword ? 'Hide password' : 'Show password'"
                :aria-pressed="canSeeThePassword"
                aria-controls="password"
                @click="canSeeThePassword = !canSeeThePassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          required
          class="w-full relative"
          label="Confirm Password"
          name="passwordConfirm"
        >
          <UInput
            v-model="registerForm.data.passwordConfirm"
            :type="canSeeTheConfirmPassword ? 'text' : 'password'"
            class="w-full"
          >
            <template #trailing>
              <UButton
                color="secondary"
                size="sm"
                variant="link"
                :icon="canSeeTheConfirmPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="canSeeTheConfirmPassword ? 'Hide password' : 'Show password'"
                :aria-pressed="canSeeTheConfirmPassword"
                aria-controls="password"
                @click="canSeeTheConfirmPassword = !canSeeTheConfirmPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <UCheckbox
          v-model="isAgreedToTerms"
          required
          color="primary"
        >
          <template #label>
            <span class="italic">I accept the
              <UButton
                variant="link"
                label="Terms and Conditions"
                class="p-0"
                @click="isOpenAgreementModel = true"
              />
            </span>
          </template>
        </UCheckbox>

        <UButton
          type="submit"
          color="primary"
          variant="solid"
          block
          class="text-bold"
          :loading="registerForm.loading"
        >
          Submit
        </UButton>

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
      </UForm>
      <div
        v-if="form.formError.value || form.errors.value.email"
        class="space-y-4 py-4"
      >
        <UAlert
          v-if="form.formError.value"
          color="error"
          variant="soft"
          :title="form.formError.value"
        />

        <UAlert
          v-if="form.errors.value.email"
          color="error"
          variant="soft"
          :title="form.errors.value.email"
        />
      </div>
    </div>

    <div
      v-else
      class="space-y-4 py-4"
    >
      <UAlert
        color="success"
        variant="soft"
        title="Sprawdź swoją skrzynkę e-mail"
        description="Wysłaliśmy do Ciebie wiadomość z linkiem weryfikacyjnym. Kliknij w link, aby aktywować swoje konto."
      />
      <p class="text-sm text-slate-600 dark:text-slate-400">
        Jeśli nie widzisz wiadomości, sprawdź folder Spam lub Oferty. Możesz też spróbować ponownie za kilka minut.
      </p>
    </div>
    <UModal
      v-model:open="isOpenAgreementModel"
      title="Terms and Conditions"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full'
      }"
    >
      <template #body>
        <div class="w-full relative  p-4">
          <div class="absolute top-2 right-4 flex items-center space-x-2">
            <p class="text-sm text-bold">
              lang:
            </p>

            <USelect
              v-model="lang"
              label="Language"
              :items="itemsSelected"
            />
          </div>

          <h2 class="text-xl font-semibold pb-4">
            Terms and Conditions
          </h2>

          <div class="w-full overflow-y-auto h-80  p-4 bg-gray-100 dark:bg-gray-800 text-justify rounded">
            <ContentRenderer
              v-if="terms"
              :value="terms"
            />
          </div>

          <div class="w-full mt-4 flex justify-between">
            <UButton
              variant="solid"
              color="error"
              label="Decline"
              @click="agreement(false)"
            />

            <UButton
              variant="solid"
              color="primary"
              label="Accept"
              @click="agreement(true)"
            />
          </div>
        </div>
      </template>
    </UModal>
  </UPageCard>
</template>
