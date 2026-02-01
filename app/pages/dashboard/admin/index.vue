<script lang="ts" setup>
import { PERMISSIONS } from '#shared/permissions'
import { useAdminResource } from '~/composables/resources/useAdminResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

useSeoMeta({
  title: 'Panel administracyjny - Dashboard',
  description: 'Zarządzanie użytkownikami, rolami i uprawnieniami'
})

function getTabColor(tabId: string): string {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    general: 'primary',
    notifications: 'success',
    privacy: 'warning',
    security: 'error',
    appearance: 'info',
    integrations: 'info'
  }
  return colors[tabId] ?? 'primary'
}

const adminResource = useAdminResource()
const overview = ref<{ usersCount: number, rolesCount: number } | null>(null)
const overviewLoading = ref(true)
const overviewError = ref<string | null>(null)
const route = useRoute()

const adminNavItems = [
  { id: 'overview', label: 'Przegląd', to: '/dashboard/admin', icon: 'i-lucide-layout-dashboard' },
  { id: 'users', label: 'Użytkownicy', to: '/dashboard/admin/users', icon: 'i-lucide-users' },
  { id: 'roles', label: 'Role', to: '/dashboard/admin/roles', icon: 'i-lucide-shield' },
  { id: 'permissions', label: 'Uprawnienia', to: '/dashboard/admin/permissions', icon: 'i-lucide-key' }
]

async function fetchOverview() {
  overviewLoading.value = true
  overviewError.value = null
  try {
    overview.value = await adminResource.getOverview()
  } catch (e) {
    overviewError.value = e instanceof Error ? e.message : 'Nie udało się załadować statystyk'
  } finally {
    overviewLoading.value = false
  }
}

onMounted(() => {
  fetchOverview()
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Panel administracyjny"
      icon="i-lucide-shield-check"
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

          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Przegląd statystyk i szybki dostęp do zarządzania użytkownikami, rolami i uprawnieniami.
          </p>

          <UAlert
            v-if="overviewError"
            color="error"
            variant="soft"
            :title="overviewError"
            class="rounded-lg"
          />

          <div
            v-if="overviewLoading"
            class="grid gap-4 md:grid-cols-2"
          >
            <UCard
              variant="soft"
              class="rounded-lg"
            >
              <div class="h-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </UCard>
            <UCard
              variant="soft"
              class="rounded-lg"
            >
              <div class="h-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
            </UCard>
          </div>
          <div
            v-else-if="overview"
            class="grid gap-4 md:grid-cols-2"
          >
            <UCard
              variant="soft"
              class="rounded-lg"
            >
              <template #header>
                <h2 class="text-lg font-semibold">
                  Użytkownicy
                </h2>
                <p class="mt-1 text-2xl font-semibold text-primary">
                  {{ overview.usersCount }}
                </p>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Lista użytkowników, przypisywanie ról, status konta.
                </p>
              </template>
              <UButton
                to="/dashboard/admin/users"
                color="primary"
                variant="soft"
              >
                Przejdź do użytkowników
              </UButton>
            </UCard>

            <UCard
              variant="soft"
              class="rounded-lg"
            >
              <template #header>
                <h2 class="text-lg font-semibold">
                  Role
                </h2>
                <p class="mt-1 text-2xl font-semibold text-primary">
                  {{ overview.rolesCount }}
                </p>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Zarządzaj rolami i przypisuj uprawnienia.
                </p>
              </template>
              <UButton
                to="/dashboard/admin/roles"
                color="primary"
                variant="soft"
              >
                Przejdź do ról
              </UButton>
            </UCard>
          </div>
          <div
            v-else
            class="grid gap-4 md:grid-cols-2"
          >
            <UCard
              variant="soft"
              class="rounded-lg"
            >
              <template #header>
                <h2 class="text-lg font-semibold">
                  Użytkownicy
                </h2>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Lista użytkowników, przypisywanie ról, status konta.
                </p>
              </template>
              <UButton
                to="/dashboard/admin/users"
                color="primary"
                variant="soft"
              >
                Przejdź do użytkowników
              </UButton>
            </UCard>

            <UCard
              variant="soft"
              class="rounded-lg"
            >
              <template #header>
                <h2 class="text-lg font-semibold">
                  Role i uprawnienia
                </h2>
                <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Zarządzaj rolami i przypisuj uprawnienia.
                </p>
              </template>
              <UButton
                to="/dashboard/admin/roles"
                color="primary"
                variant="soft"
              >
                Przejdź do ról
              </UButton>
            </UCard>
          </div>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
