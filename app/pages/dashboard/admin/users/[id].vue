<script lang="ts" setup>
import type { UserDTO, RoleDTO } from '#shared/types/auth'
import { PERMISSIONS } from '#shared/permissions'
import { useAdminResource } from '~/composables/resources/useAdminResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

const route = useRoute()
const router = useRouter()
const adminResource = useAdminResource()
const toast = useToast()

const adminNavItems = [
  { id: 'overview', label: 'Przegląd', to: '/dashboard/admin', icon: 'i-lucide-layout-dashboard' },
  { id: 'users', label: 'Użytkownicy', to: '/dashboard/admin/users', icon: 'i-lucide-users' },
  { id: 'roles', label: 'Role', to: '/dashboard/admin/roles', icon: 'i-lucide-shield' },
  { id: 'permissions', label: 'Uprawnienia', to: '/dashboard/admin/permissions', icon: 'i-lucide-key' }
]

const tabs = [
  { id: 'overview', label: 'Przegląd', icon: 'i-lucide-user' },
  { id: 'role', label: 'Rola', icon: 'i-lucide-shield' }
]

const userId = computed(() => {
  const id = route.params.id
  const n = Number(id)
  return Number.isInteger(n) && n > 0 ? n : null
})

const user = ref<UserDTO | null>(null)
const roles = ref<RoleDTO[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const roleSaving = ref(false)
const selectedRoleId = ref<number | undefined>(undefined)

const activeTab = computed({
  get: () => (route.query.tab as string) || 'overview',
  set: (tab: string) => {
    router.replace({ query: { ...route.query, tab } })
  }
})

useSeoMeta({
  title: () => user.value ? `Użytkownik ${user.value.email ?? user.value.username ?? user.value.id} - Admin` : 'Użytkownik - Admin',
  description: 'Profil użytkownika – zarządzanie przez administratora'
})

const roleOptions = computed(() =>
  roles.value.map(r => ({ label: r.name, value: r.id }))
)

async function fetchUser() {
  const id = userId.value
  if (!id) return
  loading.value = true
  loadError.value = null
  try {
    user.value = await adminResource.getUser(id)
    selectedRoleId.value = user.value.roleId ?? undefined
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Nie udało się załadować użytkownika'
    user.value = null
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    roles.value = await adminResource.getRoles()
  } catch {
    roles.value = []
  }
}

watch(userId, (id) => {
  if (id) fetchUser()
}, { immediate: true })

onMounted(() => {
  fetchRoles()
})

async function onSaveRole() {
  const id = userId.value
  const roleId = selectedRoleId.value
  if (!id || roleId === undefined || !user.value) return
  roleSaving.value = true
  try {
    await adminResource.updateUserRole(id, roleId)
    user.value = { ...user.value, roleId, role: roles.value.find(r => r.id === roleId)?.name ?? user.value.role }
    toast.add({ title: 'Zapisano', description: 'Rola została zaktualizowana.', color: 'success' })
  } catch (e) {
    toast.add({
      title: 'Błąd',
      description: e instanceof Error ? e.message : 'Nie udało się zaktualizować roli',
      color: 'error'
    })
  } finally {
    roleSaving.value = false
  }
}

async function onSetStatus(status: 'active' | 'blocked') {
  const id = userId.value
  if (!id || !user.value) return
  try {
    await adminResource.updateUserStatus(id, status)
    user.value = { ...user.value, status, deactivatedAt: status === 'blocked' ? new Date().toISOString() : null }
    toast.add({
      title: 'Zapisano',
      description: status === 'blocked' ? 'Konto zostało zablokowane.' : 'Konto zostało odblokowane.',
      color: 'success'
    })
  } catch (e) {
    toast.add({
      title: 'Błąd',
      description: e instanceof Error ? e.message : 'Nie udało się zmienić statusu',
      color: 'error'
    })
  }
}

watch(user, (u) => {
  if (u?.roleId != null) selectedRoleId.value = u.roleId
  else if (u) {
    const r = roles.value.find(x => x.name === u.role)
    selectedRoleId.value = r?.id ?? undefined
  }
}, { immediate: true })

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
      title="Profil użytkownika"
      icon="i-lucide-user-cog"
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

          <UAlert
            v-if="loadError"
            color="error"
            variant="soft"
            :title="loadError"
            class="rounded-lg"
          />

          <div
            v-else-if="loading"
            class="flex justify-center py-12"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="size-8 animate-spin text-primary"
            />
          </div>

          <template v-else-if="user">
            <!-- Zakładki -->
            <div class="flex gap-1 border-b border-default">
              <UButton
                v-for="tab in tabs"
                :key="tab.id"
                variant="ghost"
                color="neutral"
                size="sm"
                :icon="tab.icon"
                :class="{ 'border-b-2 border-primary': activeTab === tab.id }"
                @click="activeTab = tab.id"
              >
                {{ tab.label }}
              </UButton>
            </div>

            <!-- Overview -->
            <div
              v-show="activeTab === 'overview'"
              class="space-y-6"
            >
              <UCard variant="soft">
                <div class="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <UAvatar
                    :src="user.avatarUrl ?? undefined"
                    :alt="user.name ?? user.username ?? ''"
                    size="xl"
                    class="shrink-0"
                  />
                  <div class="min-w-0 flex-1 space-y-2">
                    <h2 class="text-lg font-semibold">
                      {{ user.name ?? user.username ?? user.email ?? `#${user.id}` }}
                    </h2>
                    <p class="text-sm text-muted">
                      {{ user.email ?? '—' }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ user.username ? `@${user.username}` : '—' }}
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <UBadge
                        :color="user.role === 'admin' ? 'error' : 'primary'"
                        variant="soft"
                        size="sm"
                      >
                        {{ user.role }}
                      </UBadge>
                      <UBadge
                        :color="user.status === 'blocked' ? 'error' : 'success'"
                        variant="soft"
                        size="sm"
                      >
                        {{ user.status === 'blocked' ? 'Zablokowany' : 'Aktywny' }}
                      </UBadge>
                    </div>
                    <div class="flex gap-2 pt-2">
                      <UButton
                        variant="soft"
                        color="primary"
                        size="sm"
                        icon="i-lucide-shield"
                        @click="activeTab = 'role'"
                      >
                        Edytuj rolę
                      </UButton>
                      <UButton
                        v-if="user.status === 'blocked'"
                        variant="soft"
                        color="success"
                        size="sm"
                        icon="i-lucide-unlock"
                        @click="onSetStatus('active')"
                      >
                        Odblokuj
                      </UButton>
                      <UButton
                        v-else
                        variant="soft"
                        color="error"
                        size="sm"
                        icon="i-lucide-lock"
                        @click="onSetStatus('blocked')"
                      >
                        Zablokuj
                      </UButton>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Rola -->
            <div
              v-show="activeTab === 'role'"
              class="space-y-6"
            >
              <UCard variant="soft">
                <template #header>
                  <h3 class="text-base font-semibold">
                    Edytuj rolę użytkownika
                  </h3>
                </template>
                <div class="space-y-4">
                  <UFormField
                    label="Rola"
                    name="roleId"
                  >
                    <USelect
                      v-model="selectedRoleId"
                      :items="roleOptions"
                      :disabled="roleSaving"
                      class="max-w-xs"
                    />
                  </UFormField>
                  <UButton
                    color="primary"
                    :loading="roleSaving"
                    :disabled="selectedRoleId === undefined"
                    @click="onSaveRole"
                  >
                    Zapisz rolę
                  </UButton>
                </div>
              </UCard>
            </div>
          </template>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
