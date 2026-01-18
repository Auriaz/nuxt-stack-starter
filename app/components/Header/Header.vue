<script lang="ts" setup>
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
// const { locale } = useI18n()
const isScrolled = ref(false)
// const { clear: clearUserSession, loggedIn, user } = useUserSession()

// Globalny system filtrów
const filters = useFilters()

onMounted(() => {
  const handleScroll = () => {
    isScrolled.value = window.scrollY > 50
  }

  window.addEventListener('scroll', handleScroll, { passive: true })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })
})
const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('content'))
const { data: files } = await useAsyncData('search', () => queryCollectionSearchSections('content'), { server: false })
const searchTerm = ref('')
// const handleLogout = async () => {
//   await clearUserSession()
// }
</script>

<template>
  <UHeader
    mode="drawer"
    :ui="{
      container:
        'max-w-full blur-none backdrop-blur-sm dark:bg-black/5 bg-white px-5 py-2  shadow-lg shadow-black hover:shadow-xl transition-all duration-300',
      root: [
        'fixed top-0 z-50 transition-all duration-300 w-screen',
        'border-none',
        isScrolled ? 'bg-background/90 backdrop-blur-md shadow-lg shadow-primary/5' : ''
      ].join(' '),
      center: isScrolled ? 'bg-transparent' : ''
    }"
  >
    <template #title>
      <div class="flex items-center justify-center shrink-0 relative translate-y-1  md:translate-y-3 left-4 md:left-10 -translate-x-1/2">
        <Logo />
      </div>
    </template>

    <slot />

    <template #right>
      <div class="hidden md:flex items-center gap-2 mr-5">
        <!-- Przycisk filtrów (widoczny tylko gdy strona ma filtry) -->
        <UButton
          v-if="filters.hasFilters.value"
          icon="i-lucide-filter"
          variant="ghost"
          color="primary"
          size="sm"
          :label="filters.isOpen.value ? 'Zamknij filtry' : 'Filtry'"
          @click="filters.toggle"
        />

        <ColorModeButton />

        <USeparator
          orientation="vertical"
          class="h-6"
        />

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <UContentSearchButton
            variant="subtle"
            color="primary"
            size="sm"
          />
          <ClientOnly>
            <LazyUContentSearch
              v-model:search-term="searchTerm"
              shortcut="meta_k"
              :color-mode="true"
              :files="files"
              :navigation="navigation"
              :fuse="{ resultLimit: 42 }"
            />
          </ClientOnly>
        </div>
        <!-- Auth Buttons / User Menu - Desktop -->
        <div class="hidden md:flex items-center gap-2">
          <!-- Guest: Login/Register Buttons
            <template v-if="!auth.isAuthenticated.value">
              <UButton
                to="/auth/login"
                variant="ghost"
                size="sm"
                class="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
              >
                <template #leading>
                  <UIcon
                    name="i-lucide-log-in"
                    class="w-4 h-4"
                  />
                </template>
                Zaloguj się
              </UButton>
              <UButton
                to="/auth/register"
                size="sm"
                class="glass-button-primary"
              >
                <template #leading>
                  <UIcon
                    name="i-lucide-user-plus"
                    class="w-4 h-4"
                  />
                </template>
                Rejestracja
              </UButton>
            </template>
          -->

          <!-- Authenticated: User Dropdown Menu
            <UDropdownMenu
              v-if="loggedIn"
              :items="[
                [
                  {
                    label: user?.name || 'Użytkownik',
                    slot: 'account',
                    disabled: true
                  }
                ],
                [
                  {
                    label: 'Dashboard',
                    icon: 'i-lucide-layout-dashboard',
                    to: '/dashboard'
                  },
                  {
                    label: 'Profil',
                    icon: 'i-lucide-user',
                    to: '/dashboard/settings/profile'
                  },
                  {
                    label: 'Ustawienia',
                    icon: 'i-lucide-settings',
                    to: '/dashboard/settings'
                  }
                ],
                [
                  {
                    label: 'Wyloguj się',
                    icon: 'i-lucide-log-out',
                    click: handleLogout
                  }
                ]
              ]"
              :popper="{ placement: 'bottom-end' }"
            >
              <UButton
                variant="ghost"
                size="sm"
                class="text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary"
              >
                <template #leading>
                  <UIcon
                    name="i-lucide-user"
                    class="w-4 h-4"
                  />
                </template>
                {{ user?.name || 'Użytkownik' }}
                <UIcon
                  name="i-lucide-chevron-down"
                  class="w-4 h-4 ml-1"
                />
              </UButton>

              <template #account>
                <div class="text-left">
                  <p class="font-medium text-gray-900 dark:text-white">
                    {{ user?.name }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ user?.email }}
                  </p>
                </div>
              </template>
            </UDropdownMenu>
          -->
        </div>
      </div>

      <!-- Przycisk filtrów (mobile) -->
      <UButton
        v-if="filters.hasFilters.value"
        icon="i-lucide-filter"
        variant="ghost"
        color="primary"
        size="sm"
        class="md:hidden"
        @click="filters.toggle"
      />
    </template>

    <template #body>
      <div
        class="flex flex-col h-full min-h-[60vh] px-4 py-6 space-y-6 bg-background dark:bg-slate-900 overflow-hidden"
      >
        <!-- Navigation Menu -->
        <div class="flex-1 overflow-y-auto -mx-4 px-4">
          <Navbar
            orientation="vertical"
            class="w-full"
          />
        </div>

        <!-- Footer Actions -->
        <div
          class="flex flex-col gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-700/80 shrink-0"
        >
          <!-- Auth Buttons / User Menu - Mobile

            <template v-if="!loggedIn">
              <div class="flex flex-col gap-3">
                <UButton
                  to="/auth/login"
                  variant="outline"
                  size="md"
                  block
                  class="w-full justify-center"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-log-in"
                      class="w-4 h-4"
                    />
                  </template>
                  Zaloguj się
                </UButton>
                <UButton
                  to="/auth/register"
                  size="md"
                  block
                  class="w-full justify-center glass-button-primary"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-user-plus"
                      class="w-4 h-4"
                    />
                  </template>
                  Utwórz konto
                </UButton>
              </div>
            </template>
          -->

          <!-- Authenticated: User Info and Actions - Mobile

            <template v-else>
              <div class="flex flex-col gap-3">
                <div class="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                  <p class="font-medium text-sm text-gray-900 dark:text-white">
                    {{ user?.name }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ user?.email }}
                  </p>
                </div>
                <UButton
                  to="/dashboard"
                  variant="outline"
                  size="md"
                  block
                  class="w-full justify-center"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-layout-dashboard"
                      class="w-4 h-4"
                    />
                  </template>
                  Dashboard
                </UButton>
                <UButton
                  to="/dashboard/settings/profile"
                  variant="ghost"
                  size="md"
                  block
                  class="w-full justify-center"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-user"
                      class="w-4 h-4"
                    />
                  </template>
                  Profil
                </UButton>

                <UButton
                  variant="outline"
                  size="md"
                  block
                  class="w-full justify-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  @click="handleLogout"
                >
                  <template #leading>
                    <UIcon
                      name="i-lucide-log-out"
                      class="w-4 h-4"
                    />
                  </template>
                  Wyloguj się
                </UButton>
              </div>
            </template>
          -->

          <!-- Color Mode Selector -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tryb kolorów
            </span>
            <ColorModeButton />
          </div>
        </div>
      </div>
    </template>
  </UHeader>
</template>
