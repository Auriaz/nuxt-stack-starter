<script lang="ts" setup>
import type { UserDTO } from '#shared/types/auth'
import { PERMISSIONS } from '#shared/permissions'
import { useAdminResource } from '~/composables/resources/useAdminResource'
import type { AdminUsersMeta } from '~/composables/resources/useAdminResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

useSeoMeta({
  title: 'Użytkownicy - Admin - Dashboard',
  description: 'Zarządzanie użytkownikami'
})

const adminResource = useAdminResource()
const route = useRoute()
const { user: authUser } = useAuth()
const toast = useToast()

const page = ref(1)
const limit = ref(20)
const searchQuery = ref('')
const debouncedSearch = ref('')

// Aktualizuj debouncedSearch z opóźnieniem, żeby fetch reagował na wpisywanie
watch(searchQuery, (q) => {
  const t = setTimeout(() => {
    debouncedSearch.value = q
  }, 300)
  return () => clearTimeout(t)
}, { immediate: true })

const adminNavItems = [
  { id: 'overview', label: 'Przegląd', to: '/dashboard/admin', icon: 'i-lucide-layout-dashboard' },
  { id: 'users', label: 'Użytkownicy', to: '/dashboard/admin/users', icon: 'i-lucide-users' },
  { id: 'roles', label: 'Role', to: '/dashboard/admin/roles', icon: 'i-lucide-shield' },
  { id: 'permissions', label: 'Uprawnienia', to: '/dashboard/admin/permissions', icon: 'i-lucide-key' }
]

const users = ref<UserDTO[]>([])
const meta = ref<AdminUsersMeta | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)

const currentUserId = computed(() => (authUser.value as { id?: number } | null)?.id ?? null)

async function fetchUsers() {
  loading.value = true
  loadError.value = null
  try {
    const result = await adminResource.getUsers({
      page: page.value,
      limit: limit.value,
      q: debouncedSearch.value || undefined
    })
    users.value = result.data
    meta.value = result.meta
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Nie udało się załadować użytkowników'
  } finally {
    loading.value = false
  }
}

watch([page, limit, debouncedSearch], () => {
  fetchUsers()
}, { immediate: true })

function onEditRole(user: UserDTO) {
  navigateTo({ path: `/dashboard/admin/users/${user.id}`, query: { tab: 'role' } })
}

async function onSetStatus(user: UserDTO, status: 'active' | 'blocked') {
  try {
    await adminResource.updateUserStatus(user.id, status)
    toast.add({
      title: 'Zapisano',
      description: status === 'blocked' ? 'Konto zostało zablokowane.' : 'Konto zostało odblokowane.',
      color: 'success'
    })
    await fetchUsers()
  } catch (e) {
    toast.add({
      title: 'Błąd',
      description: e instanceof Error ? e.message : 'Nie udało się zmienić statusu',
      color: 'error'
    })
  }
}

function onPageChange(newPage: number) {
  page.value = newPage
}

function getTabColor(tabId: string): 'primary' | 'success' | 'warning' | 'error' | 'info' {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    overview: 'primary',
    users: 'primary',
    roles: 'primary',
    permissions: 'primary'
  }
  return colors[tabId] ?? 'primary'
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Użytkownicy"
      icon="i-lucide-users"
    >
      <template #body>
        <div class="space-y-6 p-4 sm:p-6 lg:p-8">
          <UCard
            variant="soft"
            padding="none"
            class="overflow-hidden"
          >
            <nav class="flex flex-wrap sm:flex-nowrap">
              <UButton
                v-for="tab in adminNavItems"
                :key="tab.id"
                :to="tab.to"
                :variant="route.path === tab.to ? 'solid' : 'ghost'"
                :color="route.path === tab.to ? (getTabColor(tab.id) as 'primary' | 'success' | 'warning' | 'error' | 'info') : 'secondary'"
                :class="[
                  'flex flex-1 items-center gap-2 whitespace-nowrap rounded-none border-0 px-4 py-3 text-sm font-medium transition-all duration-300 sm:flex-none sm:px-6 sm:py-4',
                  route.path === tab.to
                    ? `${getTabColor(tab.id)} scale-105 transform text-white shadow-lg`
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                ]"
              >
                <UIcon
                  :name="tab.icon"
                  class="h-4 w-4 shrink-0"
                />
                <span class="hidden sm:inline">{{ tab.label }}</span>
              </UButton>
            </nav>
          </UCard>

          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <UInput
              v-model="searchQuery"
              placeholder="Szukaj po email lub nazwie..."
              icon="i-lucide-search"
              class="max-w-xs"
            />
          </div>

          <UAlert
            v-if="loadError"
            color="error"
            variant="soft"
            :title="loadError"
            class="rounded-lg"
          />

          <DashboardAdminUsersTable
            :users="users"
            :meta="meta"
            :loading="loading"
            :current-user-id="currentUserId"
            @edit-role="onEditRole"
            @set-status="onSetStatus"
            @update:page="onPageChange"
          />
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
