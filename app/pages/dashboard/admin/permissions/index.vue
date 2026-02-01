<script lang="ts" setup>
import type { PermissionDTO } from '#shared/types/auth'
import { PERMISSIONS } from '#shared/permissions'
import { useAdminResource } from '~/composables/resources/useAdminResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

useSeoMeta({
  title: 'Uprawnienia - Admin - Dashboard',
  description: 'Lista uprawnień (tylko do odczytu)'
})

const adminResource = useAdminResource()
const route = useRoute()
const permissions = ref<PermissionDTO[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)

const adminNavItems = [
  { id: 'overview', label: 'Przegląd', to: '/dashboard/admin', icon: 'i-lucide-layout-dashboard' },
  { id: 'users', label: 'Użytkownicy', to: '/dashboard/admin/users', icon: 'i-lucide-users' },
  { id: 'roles', label: 'Role', to: '/dashboard/admin/roles', icon: 'i-lucide-shield' },
  { id: 'permissions', label: 'Uprawnienia', to: '/dashboard/admin/permissions', icon: 'i-lucide-key' }
]

const groupedPermissions = computed(() => {
  const groups = new Map<string, PermissionDTO[]>()
  for (const permission of permissions.value) {
    const group = permission.group ?? 'Inne'
    const list = groups.get(group) ?? []
    list.push(permission)
    groups.set(group, list)
  }
  return Array.from(groups.entries()).map(([group, perms]) => ({
    group,
    permissions: perms.sort((a, b) => a.key.localeCompare(b.key))
  }))
})

async function fetchPermissions() {
  loading.value = true
  loadError.value = null
  try {
    permissions.value = await adminResource.getPermissions()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Nie udało się załadować uprawnień'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPermissions()
})

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
      title="Uprawnienia"
      icon="i-lucide-key"
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
            Lista uprawnień zgrupowana wg kategorii — tylko do odczytu. Przypisywanie do ról w sekcji Role.
          </p>

          <UAlert
            v-if="loadError"
            color="error"
            variant="soft"
            :title="loadError"
            class="rounded-lg"
          />

          <div
            v-if="loading"
            class="space-y-4"
          >
            <div
              v-for="i in 4"
              :key="i"
              class="h-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
            />
          </div>

          <div
            v-else
            class="space-y-8"
          >
            <UCard
              v-for="group in groupedPermissions"
              :key="group.group"
              variant="soft"
              class="rounded-lg"
            >
              <template #header>
                <h3 class="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-400">
                  {{ group.group }}
                </h3>
              </template>
              <ul class="space-y-2">
                <li
                  v-for="perm in group.permissions"
                  :key="perm.key"
                  class="flex items-center justify-between rounded-md py-1.5 text-sm"
                >
                  <code class="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-xs dark:bg-neutral-800">{{ perm.key }}</code>
                  <span class="text-neutral-500 dark:text-neutral-400">{{ perm.label ?? perm.key }}</span>
                </li>
              </ul>
            </UCard>
          </div>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
