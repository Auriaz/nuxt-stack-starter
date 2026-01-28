<script lang="ts" setup>
definePageMeta({
  layout: 'guest',
  middleware: 'guest'
})

const route = useRoute()
const router = useRouter()

const slug = computed(() => route.params.slug as string)

// Mapowanie slugów do typów formularzy
const formType = computed(() => {
  const slugValue = slug.value?.toLowerCase()
  if (slugValue === 'login' || slugValue === 'logowanie') {
    return 'login'
  }
  if (slugValue === 'register' || slugValue === 'rejestracja' || slugValue === 'signup') {
    return 'register'
  }
  if (slugValue === 'forgot-password' || slugValue === 'reset-hasla' || slugValue === 'password-reset') {
    return 'forgot-password'
  }
  if (slugValue === 'reset-password') {
    return 'reset-password'
  }
  // Domyślnie login
  return 'login'
})

// Funkcje przełączania między formularzami
function switchToLogin() {
  router.push('/auth/login')
}

function switchToRegister() {
  router.push('/auth/register')
}

function switchToForgotPassword() {
  router.push('/auth/forgot-password')
}

// SEO Meta
const seoConfig = computed(() => {
  switch (formType.value) {
    case 'login':
      return {
        title: 'Logowanie - Web Space',
        description: 'Zaloguj się do swojego konta w Web Space'
      }
    case 'register':
      return {
        title: 'Rejestracja - Web Space',
        description: 'Utwórz nowe konto w Web Space'
      }
    case 'forgot-password':
      return {
        title: 'Resetuj hasło - Web Space',
        description: 'Zresetuj hasło do swojego konta w Web Space'
      }
    default:
      return {
        title: 'Autoryzacja - Web Space',
        description: 'Zaloguj się lub utwórz konto w Web Space'
      }
  }
})

useSeoMeta({
  title: seoConfig.value.title,
  description: seoConfig.value.description
})

// Przekierowanie jeśli slug jest nieprawidłowy
watch(slug, (newSlug) => {
  const validSlugs = ['login', 'register', 'forgot-password', 'reset-password', 'logowanie', 'rejestracja', 'reset-hasla', 'signup', 'password-reset']
  if (newSlug && !validSlugs.includes(newSlug.toLowerCase())) {
    router.replace('/auth/login')
  }
}, { immediate: true })
</script>

<template>
  <NuxtLayout name="guest">
    <div class="w-full flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 lg:py-20 min-h-[calc(100vh-4rem)]">
      <div class="w-full max-w-md mx-auto">
        <Transition
          mode="out-in"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 translate-y-4 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 -translate-y-4 scale-95"
        >
          <!-- Login Form -->
          <AuthLoginForm
            v-if="formType === 'login'"
            :key="'login'"
            @switch-to-register="switchToRegister"
            @switch-to-forgot-password="switchToForgotPassword"
          />

          <!-- Register Form -->
          <AuthRegisterForm
            v-else-if="formType === 'register'"
            :key="'register'"
            @switch-to-login="switchToLogin"
          />

          <!-- Forgot Password Form -->
          <AuthForgotPasswordForm
            v-else-if="formType === 'forgot-password'"
            :key="'forgot-password'"
            @switch-to-login="switchToLogin"
          />

          <!-- Reset Password Form -->
          <AuthResetPasswordForm
            v-else-if="formType === 'reset-password'"
            :key="'reset-password'"
          />
        </Transition>
      </div>
    </div>
  </NuxtLayout>
</template>
