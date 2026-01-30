<script lang="ts" setup>
import { useProfile2FA } from '~/composables/resources/useProfile2FA'

const { status, fetchStatus, setupAuthenticator, verify, disable, regenerateRecoveryCodes, isLoading, errors } = useProfile2FA()

const showSetup = ref(false)
const showRecoveryCodes = ref(false)
const qrCodeUrl = ref<string | null>(null)
const secret = ref<string | null>(null)
const verificationCode = ref('')
const recoveryCodes = ref<string[]>([])
const disablePassword = ref('')
const showDisableForm = ref(false)

onMounted(async () => {
  await fetchStatus()
})

const handleSetup = async () => {
  const setup = await setupAuthenticator()
  if (setup) {
    qrCodeUrl.value = setup.qr_code_url
    secret.value = setup.secret
    showSetup.value = true
  }
}

const handleVerify = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    return
  }

  const result = await verify(verificationCode.value)
  if (result) {
    recoveryCodes.value = result.recovery_codes
    showRecoveryCodes.value = true
    showSetup.value = false
    verificationCode.value = ''
  }
}

const handleDisable = async () => {
  if (!disablePassword.value) {
    return
  }

  const success = await disable(disablePassword.value)
  if (success) {
    showDisableForm.value = false
    disablePassword.value = ''
    showRecoveryCodes.value = false
  }
}

const handleRegenerateRecoveryCodes = async () => {
  const codes = await regenerateRecoveryCodes()
  if (codes) {
    recoveryCodes.value = codes
    showRecoveryCodes.value = true
  }
}

const copyRecoveryCodes = () => {
  const text = recoveryCodes.value.join('\n')
  navigator.clipboard.writeText(text)
  useToast().add({
    title: 'Sukces',
    description: 'Kody odzyskiwania zostały skopiowane do schowka',
    color: 'success'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Status 2FA -->
    <div class="rounded-xl border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-700 dark:bg-neutral-800">
      <div class="flex items-center justify-between">
        <div>
          <h4 class="mb-2 flex items-center gap-2 text-lg font-semibold">
            <UIcon
              name="i-heroicons-shield-check"
              class="h-5 w-5 text-primary-500"
            />
            Two-Factor Authentication
          </h4>
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            {{ status?.enabled ? '2FA jest włączone i chroni Twoje konto.' : 'Włącz 2FA, aby zwiększyć bezpieczeństwo swojego konta.' }}
          </p>
        </div>
        <UBadge
          :color="status?.enabled ? 'success' : 'neutral'"
          size="lg"
        >
          {{ status?.enabled ? 'Włączone' : 'Wyłączone' }}
        </UBadge>
      </div>
    </div>

    <!-- Setup 2FA -->
    <div
      v-if="!status?.enabled && !showSetup"
      class="space-y-4"
    >
      <UButton
        color="primary"
        icon="i-heroicons-shield-check"
        :loading="isLoading"
        @click="handleSetup"
      >
        Włącz 2FA
      </UButton>
    </div>

    <!-- QR Code Setup -->
    <UCard
      v-if="showSetup && !status?.enabled"
      variant="subtle"
    >
      <template #header>
        <h4 class="text-lg font-semibold">
          Skanuj kod QR
        </h4>
      </template>

      <div class="space-y-4">
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Otwórz aplikację Authenticator (np. Google Authenticator, Authy) i zeskanuj ten kod QR:
        </p>

        <div class="flex justify-center">
          <div
            v-if="qrCodeUrl"
            class="rounded-lg border-4 border-neutral-200 bg-white p-4 dark:border-neutral-700"
          >
            <img
              :src="qrCodeUrl"
              alt="QR Code"
              class="h-64 w-64"
            >
          </div>
        </div>

        <div
          v-if="secret"
          class="rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <p class="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Lub wprowadź ten kod ręcznie:
          </p>
          <code class="text-sm font-mono text-neutral-900 dark:text-neutral-100">{{ secret }}</code>
        </div>

        <UFormField
          label="Kod weryfikacyjny"
          name="verification_code"
          :error="errors.root"
        >
          <UInput
            v-model="verificationCode"
            type="text"
            placeholder="000000"
            maxlength="6"
            :disabled="isLoading"
            @input="verificationCode = verificationCode.replace(/\D/g, '')"
          />
          <template #hint>
            <span class="text-xs text-neutral-500">
              Wprowadź 6-cyfrowy kod z aplikacji Authenticator.
            </span>
          </template>
        </UFormField>

        <div class="flex gap-3">
          <UButton
            variant="outline"
            color="neutral"
            :disabled="isLoading"
            @click="showSetup = false; qrCodeUrl = null; secret = null"
          >
            Anuluj
          </UButton>
          <UButton
            color="primary"
            :loading="isLoading"
            :disabled="!verificationCode || verificationCode.length !== 6 || isLoading"
            @click="handleVerify"
          >
            Zweryfikuj i aktywuj
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Recovery Codes -->
    <UCard
      v-if="showRecoveryCodes && recoveryCodes.length > 0"
      variant="subtle"
      color="warning"
    >
      <template #header>
        <h4 class="text-lg font-semibold">
          Kody odzyskiwania
        </h4>
      </template>

      <div class="space-y-4">
        <div class="rounded-lg border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
          <div class="flex items-start gap-2">
            <UIcon
              name="i-heroicons-exclamation-triangle"
              class="h-5 w-5 text-warning-600 dark:text-warning-400"
            />
            <div class="text-sm text-warning-700 dark:text-warning-300">
              <p class="font-semibold mb-1">
                Zapisz te kody w bezpiecznym miejscu!
              </p>
              <p>Użyj ich, jeśli stracisz dostęp do aplikacji Authenticator. Każdy kod może być użyty tylko raz.</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800">
          <div
            v-for="(code, index) in recoveryCodes"
            :key="index"
            class="font-mono text-sm text-neutral-900 dark:text-neutral-100"
          >
            {{ code }}
          </div>
        </div>

        <div class="flex gap-3">
          <UButton
            variant="outline"
            color="neutral"
            icon="i-heroicons-clipboard-document"
            @click="copyRecoveryCodes"
          >
            Kopiuj kody
          </UButton>
          <UButton
            color="primary"
            @click="showRecoveryCodes = false"
          >
            Zapisałem kody
          </UButton>
        </div>
      </div>
    </UCard>

    <!-- Disable 2FA -->
    <div
      v-if="status?.enabled && !showDisableForm"
      class="space-y-4"
    >
      <div class="rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20">
        <div class="flex items-start gap-2">
          <UIcon
            name="i-heroicons-information-circle"
            class="h-5 w-5 text-warning-600 dark:text-warning-400"
          />
          <div class="text-sm text-warning-700 dark:text-warning-300">
            <p>2FA jest włączone. Masz {{ status?.recovery_codes_count || 0 }} kodów odzyskiwania dostępnych.</p>
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <UButton
          variant="outline"
          color="warning"
          icon="i-heroicons-arrow-path"
          :loading="isLoading"
          @click="handleRegenerateRecoveryCodes"
        >
          Wygeneruj nowe kody odzyskiwania
        </UButton>
        <UButton
          color="error"
          variant="outline"
          icon="i-heroicons-x-circle"
          :loading="isLoading"
          @click="showDisableForm = true"
        >
          Wyłącz 2FA
        </UButton>
      </div>
    </div>

    <!-- Disable Form -->
    <UCard
      v-if="showDisableForm"
      variant="subtle"
      color="error"
    >
      <template #header>
        <h4 class="text-lg font-semibold">
          Wyłącz 2FA
        </h4>
      </template>

      <div class="space-y-4">
        <div class="rounded-lg border border-error-200 bg-error-50 p-4 dark:border-error-800 dark:bg-error-900/20">
          <p class="text-sm text-error-700 dark:text-error-300">
            Wyłączenie 2FA zmniejszy bezpieczeństwo Twojego konta. Aby kontynuować, wprowadź swoje hasło.
          </p>
        </div>

        <UFormField
          label="Hasło"
          name="password"
          :error="errors.root"
        >
          <UInput
            v-model="disablePassword"
            type="password"
            placeholder="••••••••"
            :disabled="isLoading"
          />
        </UFormField>

        <div class="flex gap-3">
          <UButton
            variant="outline"
            color="neutral"
            :disabled="isLoading"
            @click="showDisableForm = false; disablePassword = ''"
          >
            Anuluj
          </UButton>
          <UButton
            color="error"
            :loading="isLoading"
            :disabled="!disablePassword || isLoading"
            @click="handleDisable"
          >
            Wyłącz 2FA
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>
