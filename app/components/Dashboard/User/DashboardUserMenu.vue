<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useAuth } from '~/composables/useAuth'
import { useProfile } from '~/composables/resources/useProfile'
import { getDashboardMenuItemsForFooter } from '~/utils/dashboardNavigation'

const { user, isLoggedIn, logout } = useAuth()
const { profile, fetchProfile } = useProfile()
const router = useRouter()
const route = useRoute()
const toast = useToast()
const { hasRole } = useAccess()
const isLoggingOut = ref(false)

// Pobierz profil przy montowaniu (tylko po stronie klienta)
onMounted(async () => {
  // Upewnij się, że user jest załadowany
  if (isLoggedIn.value && !user.value) {
    await fetchProfile()
  }
  // Pobierz profil jeśli użytkownik jest zalogowany
  if (isLoggedIn.value && !profile.value) {
    await fetchProfile()
  }
})

// Watch na zmianę stanu autentykacji i załaduj profil jeśli potrzeba
watch(() => isLoggedIn.value, async (isAuthenticated) => {
  if (isAuthenticated && !profile.value) {
    await fetchProfile()
  }
}, { immediate: false })

const handleLogout = async () => {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true
  try {
    await logout()
    toast.add({
      title: 'Wylogowano',
      description: 'Zostałeś pomyślnie wylogowany.',
      color: 'success'
    })
    await router.push('/')
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Nie udało się wylogować'
    toast.add({
      title: 'Błąd',
      description: message,
      color: 'error'
    })
  } finally {
    isLoggingOut.value = false
  }
}

const getFullName = computed(() => {
  return profile.value?.name || profile.value?.username || user.value?.name || 'Użytkownik'
})

const getInitials = computed(() => {
  const name = profile.value?.name || user.value?.name
  if (name) {
    const parts = name.split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) {
      const first = parts[0]?.[0]
      const last = parts[parts.length - 1]?.[0]
      if (first && last) return `${first}${last}`.toUpperCase()
    }
    if (name.length >= 2) return name.slice(0, 2).toUpperCase()
  }
  return 'U'
})

/** Pełny URL avatara (origin + ścieżka), żeby UAvatar poprawnie ładował /api/media/:id/serve */
const avatarSrc = useAvatarSrc(() => profile.value?.avatarUrl ?? undefined)

// Menu items dla UDropdownMenu — jedna źródłowa definicja w dashboardNavigation.ts
const menuItems = computed<DropdownMenuItem[][]>(() => {
  if (!isLoggedIn.value || !user.value) {
    return []
  }

  return getDashboardMenuItemsForFooter({
    userEmail: user.value.email ?? '',
    avatarSrc: avatarSrc.value,
    fullName: getFullName.value,
    initials: getInitials.value,
    routePath: route.path,
    routeQuery: route.query as Record<string, unknown>,
    hasAdminRole: hasRole('admin'),
    onLogout: handleLogout
  }) as DropdownMenuItem[][]
})

// Sprawdź czy menu powinno być widoczne
const showMenu = computed(() => {
  return isLoggedIn.value && user.value && menuItems.value.length > 0
})
</script>

<template>
  <ClientOnly>
    <UDropdownMenu
      v-if="showMenu"
      :items="menuItems"
      :popper="{ placement: 'bottom-end', offset: 8 }"
      :ui="{
        content: 'w-72',
        item: 'px-4 py-3 gap-3',
        label: 'px-4 py-4 gap-3',
        separator: 'my-2'
      }"
    >
      <DashboardUserMenuTrigger
        :profile="profile"
      />

      <template #account>
        <div class="text-left px-4 py-4 flex items-center gap-2">
          <UAvatar
            :src="avatarSrc"
            :alt="getFullName"
            :text="getInitials"
            size="sm"
            class="ring-2 ring-basic-200 dark:ring-basic-700"
          />
          <div class="flex flex-col items-start">
            <p class="font-semibold text-sm text-basic-900 dark:text-basic-100">
              {{ getFullName }}
            </p>
            <p class="text-xs text-basic-500 dark:text-basic-400 mt-1">
              {{ profile?.email ?? user?.email }}
            </p>
          </div>
        </div>
      </template>
    </UDropdownMenu>

    <DashboardUserMenuTrigger
      v-else
      :profile="profile || null"
    />
    <template #fallback>
      <DashboardUserMenuTrigger
        :profile="null"
      />
    </template>
  </ClientOnly>
</template>
