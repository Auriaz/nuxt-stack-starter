<script lang="ts" setup>
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - prosty page z kompozycją Nuxt, typy globalne
import { useAuthResource } from '~/composables/resources/useAuthResource'

definePageMeta({
  layout: 'guest'
})

const route = useRoute()
const router = useRouter()

const status = ref<'pending' | 'success' | 'expired' | 'already-used' | 'invalid' | 'error'>('pending')
const message = ref<string | null>(null)
const resendEmail = ref('')
const resendPending = ref(false)

const { verifyEmail, resendVerification } = useAuthResource()

const token = computed(() => route.query.token as string | undefined)

watchEffect(async () => {
  if (!token.value) {
    status.value = 'invalid'
    message.value = 'Brakuje tokenu weryfikacyjnego w adresie URL.'
    return
  }

  status.value = 'pending'
  message.value = null

  try {
    await verifyEmail({ token: token.value })
    status.value = 'success'
    message.value = 'Konto zostało pomyślnie zweryfikowane. Możesz się teraz zalogować.'

    // Przekieruj do formularza logowania po krótkiej chwili
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
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

    if (code === 'TOKEN_EXPIRED') {
      status.value = 'expired'
      message.value = 'Link weryfikacyjny wygasł. Możesz wysłać nowy link poniżej.'
    } else if (code === 'TOKEN_ALREADY_USED') {
      status.value = 'already-used'
      message.value = 'Konto jest już zweryfikowane. Możesz się zalogować.'
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } else if (code === 'TOKEN_INVALID') {
      status.value = 'invalid'
      message.value = 'Link weryfikacyjny jest nieprawidłowy. Wyślij nowy link poniżej.'
    } else {
      status.value = 'error'
      message.value = 'Wystąpił błąd podczas weryfikacji. Spróbuj ponownie później.'
    }
  }
})

async function handleResend() {
  if (!resendEmail.value) {
    message.value = 'Podaj adres e-mail, aby wysłać nowy link weryfikacyjny.'
    status.value = 'error'
    return
  }

  resendPending.value = true
  try {
    await resendVerification({ email: resendEmail.value })
    status.value = 'success'
    message.value = 'Jeśli konto istnieje i nie zostało jeszcze zweryfikowane, wysłaliśmy nowy link weryfikacyjny.'
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

    if (code === 'RATE_LIMITED') {
      status.value = 'error'
      message.value = 'Zbyt wiele prób. Spróbuj ponownie za kilka minut.'
    } else {
      status.value = 'error'
      message.value = 'Nie udało się wysłać nowego linku. Spróbuj ponownie później.'
    }
  } finally {
    resendPending.value = false
  }
}
</script>

<template>
  <NuxtLayout name="guest">
    <div class="w-full flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20 min-h-[calc(100vh-4rem)]">
      <div class="w-full max-w-md mx-auto">
        <UPageCard
          variant="ghost"
          class="w-full glass-panel cockpit-panel relative overflow-hidden"
        >
          <div class="cockpit-hud-corners" />

          <div class="space-y-4">
            <div>
              <h1 class="text-xl font-semibold">
                Weryfikacja adresu e-mail
              </h1>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Sprawdzamy status Twojego linku weryfikacyjnego.
              </p>
            </div>

            <div v-if="status === 'pending'">
              <UAlert
                color="info"
                variant="soft"
                title="Trwa weryfikacja..."
                description="Proszę czekać, sprawdzamy ważność linku."
              />
            </div>

            <div v-else-if="message">
              <UAlert
                :color="status === 'success' || status === 'already-used' ? 'success' : 'error'"
                variant="soft"
                :title="status === 'success' || status === 'already-used' ? 'Gotowe' : 'Informacja'"
                :description="message"
              />
            </div>

            <div class="space-y-3">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Jeśli nie otrzymałeś wiadomości lub link wygasł, możesz wysłać nowy link weryfikacyjny.
              </p>

              <UFormField
                label="Adres e-mail"
                name="email"
              >
                <UInput
                  v-model="resendEmail"
                  type="email"
                  placeholder="twoj@email.pl"
                  class="w-full"
                />
              </UFormField>

              <UButton
                block
                color="primary"
                :loading="resendPending"
                @click="handleResend"
              >
                Wyślij ponownie link weryfikacyjny
              </UButton>
            </div>
          </div>
        </UPageCard>
      </div>
    </div>
  </NuxtLayout>
</template>
