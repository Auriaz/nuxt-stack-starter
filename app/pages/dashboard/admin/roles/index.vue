<script lang="ts" setup>
import { CreateRoleInputSchema, UpdateRoleInputSchema } from '#shared/schemas/admin'
import type { RoleDTO, PermissionDTO } from '#shared/types/auth'
import type { PermissionKey } from '#shared/permissions'
import { PERMISSIONS } from '#shared/permissions'
import { useAdminResource } from '~/composables/resources/useAdminResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

useSeoMeta({
  title: 'Role - Admin - Dashboard',
  description: 'Zarządzanie rolami i uprawnieniami'
})

const adminResource = useAdminResource()
const route = useRoute()
const toast = useToast()

const adminNavItems = [
  { id: 'overview', label: 'Przegląd', to: '/dashboard/admin', icon: 'i-lucide-layout-dashboard' },
  { id: 'users', label: 'Użytkownicy', to: '/dashboard/admin/users', icon: 'i-lucide-users' },
  { id: 'roles', label: 'Role', to: '/dashboard/admin/roles', icon: 'i-lucide-shield' },
  { id: 'permissions', label: 'Uprawnienia', to: '/dashboard/admin/permissions', icon: 'i-lucide-key' }
]

const roles = ref<RoleDTO[]>([])
const permissions = ref<PermissionDTO[]>([])
const loading = ref(true)
const loadError = ref<string | null>(null)
const selectedRoleId = ref<number | null>(null)
const selectedRole = computed(() => roles.value.find(r => r.id === selectedRoleId.value) ?? null)
const selectedPermissions = ref<PermissionKey[]>([])
const savingRole = ref(false)
const savingPermissions = ref(false)

const updateForm = useForm(UpdateRoleInputSchema, { initialValues: { name: '', description: undefined } })
watch(selectedRole, (role) => {
  if (role) {
    updateForm.setValues({ name: role.name, description: role.description ?? undefined })
    selectedPermissions.value = [...(role.permissions ?? [])]
  }
}, { immediate: true })

const createDrawerOpen = ref(false)
const createForm = useForm(CreateRoleInputSchema, { initialValues: { name: '', description: undefined } })
const creating = ref(false)

async function fetchRoles() {
  loading.value = true
  loadError.value = null
  try {
    roles.value = await adminResource.getRoles()
    if (selectedRoleId.value != null && !roles.value.some(r => r.id === selectedRoleId.value)) {
      selectedRoleId.value = roles.value[0]?.id ?? null
    }
    if (selectedRoleId.value == null && roles.value.length) {
      selectedRoleId.value = roles.value[0]?.id ?? null
    }
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Nie udało się załadować ról'
  } finally {
    loading.value = false
  }
}

async function fetchPermissions() {
  try {
    permissions.value = await adminResource.getPermissions()
  } catch {
    permissions.value = []
  }
}

onMounted(async () => {
  await Promise.all([fetchRoles(), fetchPermissions()])
})

const isSystemRole = (role: RoleDTO) => role.name === 'admin'

async function onUpdateRoleSubmit(values: { name?: string, description?: string | null }) {
  if (!selectedRole.value || isSystemRole(selectedRole.value)) return
  savingRole.value = true
  try {
    await adminResource.updateRole(selectedRole.value.id, values)
    toast.add({ title: 'Zapisano', description: 'Rola została zaktualizowana.', color: 'success' })
    await fetchRoles()
  } catch (e) {
    updateForm.setErrorsFromApi(e)
  } finally {
    savingRole.value = false
  }
}

function setSelectedPermissions(keys: PermissionKey[]) {
  selectedPermissions.value = keys
}

async function onSavePermissions() {
  if (!selectedRole.value) return
  savingPermissions.value = true
  try {
    await adminResource.updateRolePermissions(selectedRole.value.id, selectedPermissions.value)
    toast.add({ title: 'Zapisano', description: 'Uprawnienia zostały zaktualizowane.', color: 'success' })
    await fetchRoles()
  } catch (e) {
    toast.add({ title: 'Błąd', description: e instanceof Error ? e.message : 'Nie udało się zapisać uprawnień', color: 'error' })
  } finally {
    savingPermissions.value = false
  }
}

function openCreateDrawer() {
  createForm.reset()
  createDrawerOpen.value = true
}

async function onCreateSubmit(values: { name?: string, description?: string | null }) {
  creating.value = true
  try {
    const created = await adminResource.createRole({
      name: values.name ?? '',
      description: values.description
    })
    toast.add({ title: 'Utworzono', description: `Rola "${created.name}" została utworzona.`, color: 'success' })
    createDrawerOpen.value = false
    await fetchRoles()
    selectedRoleId.value = created.id
  } catch (e) {
    createForm.setErrorsFromApi(e)
  } finally {
    creating.value = false
  }
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
      title="Role"
      icon="i-lucide-shield"
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

          <div class="flex flex-wrap items-center justify-between gap-4">
            <p class="text-sm text-neutral-600 dark:text-neutral-400">
              Zarządzaj rolami i przypisuj uprawnienia.
            </p>
            <UButton
              color="primary"
              icon="i-lucide-plus"
              @click="openCreateDrawer"
            >
              Dodaj rolę
            </UButton>
          </div>

          <UAlert
            v-if="loadError"
            color="error"
            variant="soft"
            :title="loadError"
            class="rounded-lg"
          />

          <div
            v-if="loading"
            class="space-y-2"
          >
            <div
              v-for="i in 5"
              :key="i"
              class="h-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
            />
          </div>

          <div
            v-else
            class="grid gap-6 lg:grid-cols-[280px_1fr]"
          >
            <UCard variant="soft">
              <ul class="space-y-1">
                <li
                  v-for="role in roles"
                  :key="role.id"
                  class="rounded-md"
                >
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-left text-sm rounded-md transition-colors"
                    :class="selectedRoleId === role.id
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'"
                    @click="selectedRoleId = role.id"
                  >
                    <span class="font-medium">{{ role.name }}</span>
                    <span
                      v-if="role.permissions?.length"
                      class="ml-2 text-xs text-neutral-500"
                    >
                      ({{ role.permissions.length }})
                    </span>
                  </button>
                </li>
              </ul>
            </UCard>

            <AdminRoleEditor
              :role="selectedRole"
              :form="updateForm"
              :permissions="permissions"
              :selected-permissions="selectedPermissions"
              :saving-role="savingRole"
              :saving-permissions="savingPermissions"
              :disable-name-edit="selectedRole != null && isSystemRole(selectedRole)"
              @submit="onUpdateRoleSubmit"
              @update:selected-permissions="setSelectedPermissions"
              @save-permissions="onSavePermissions"
            />
          </div>
        </div>
      </template>
    </DashboardPanel>

    <USlideover
      v-model:open="createDrawerOpen"
      title="Dodaj rolę"
    >
      <template #content>
        <div class="p-6">
          <UForm
            :schema="CreateRoleInputSchema"
            :state="createForm.values.value"
            @submit="createForm.handleSubmit((v: { name?: string, description?: string | null }) => onCreateSubmit(v))"
          >
            <UFormField
              label="Nazwa"
              name="name"
              :error="createForm.errors.value?.name"
            >
              <UInput
                :model-value="createForm.values.value?.name"
                placeholder="np. editor"
                @update:model-value="createForm.setField('name', $event)"
              />
            </UFormField>
            <UFormField
              label="Opis"
              name="description"
              :error="createForm.errors.value?.description"
            >
              <UTextarea
                :model-value="createForm.values.value?.description"
                placeholder="Opis roli"
                @update:model-value="createForm.setField('description', $event)"
              />
            </UFormField>
            <UAlert
              v-if="createForm.formError.value"
              color="error"
              variant="soft"
              :title="createForm.formError.value"
              class="mt-4"
            />
            <div class="mt-6 flex justify-end gap-2">
              <UButton
                variant="ghost"
                color="neutral"
                @click="createDrawerOpen = false"
              >
                Anuluj
              </UButton>
              <UButton
                type="button"
                color="primary"
                :loading="creating"
                @click="createForm.handleSubmit(onCreateSubmit)({ data: createForm.values.value } as any)"
              >
                Utwórz
              </UButton>
            </div>
          </UForm>
        </div>
      </template>
    </USlideover>
  </NuxtLayout>
</template>
