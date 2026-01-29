<script setup lang="ts">
import { CreateRoleInputSchema, UpdateRoleInputSchema } from '#shared/schemas/admin'
import { PERMISSIONS, type PermissionKey } from '#shared/permissions'
import type { RoleDTO, PermissionDTO } from '#shared/types/auth'
import { useAdminResource } from '~/composables/resources/useAdminResource'

definePageMeta({
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

const adminResource = useAdminResource()
const toast = useToast()

const { data: rolesData, pending: rolesPending, refresh: refreshRoles } = useAsyncData<RoleDTO[]>(
  'admin-roles',
  () => adminResource.getRoles()
)
const { data: permissionsData } = useAsyncData<PermissionDTO[]>(
  'admin-permissions',
  () => adminResource.getPermissions()
)

const selectedRoleId = ref<number | null>(null)
const selectedRole = computed(() => (rolesData.value ?? []).find(role => role.id === selectedRoleId.value) ?? null)
const rolesList = computed(() => rolesData.value ?? [])

watch(
  rolesList,
  (roles) => {
    if (!roles || roles.length === 0) {
      selectedRoleId.value = null
      return
    }
    const firstRole = roles[0]
    if (!selectedRoleId.value && firstRole) {
      selectedRoleId.value = firstRole.id
    }
  },
  { immediate: true }
)

const createForm = useForm(CreateRoleInputSchema, {
  initialValues: {
    name: '',
    description: ''
  }
})
const createValues = computed(() => createForm.values.value)
const createPending = computed(() => createForm.pending.value)
const createError = computed(() => createForm.formError.value)

const editForm = useForm(UpdateRoleInputSchema, {
  initialValues: {
    name: '',
    description: ''
  }
})

const selectedPermissions = ref<PermissionKey[]>([])
const savingRole = ref(false)
const savingPermissions = ref(false)

watch(
  selectedRole,
  (role) => {
    if (!role) {
      editForm.reset()
      selectedPermissions.value = []
      return
    }
    editForm.setValues({
      name: role.name,
      description: role.description ?? ''
    })
    selectedPermissions.value = role.permissions
  },
  { immediate: true }
)

async function createRole(values: { name: string, description?: string | null }) {
  try {
    await adminResource.createRole({
      name: values.name,
      description: values.description ?? null
    })
    createForm.reset()
    await refreshRoles()
    toast.add({
      title: 'Utworzono rolę',
      description: 'Nowa rola została dodana',
      color: 'success'
    })
  } catch (error: unknown) {
    createForm.setErrorsFromApi(error)
  }
}

async function updateRole(values: { name?: string, description?: string | null }) {
  if (!selectedRole.value) {
    return
  }
  savingRole.value = true
  try {
    await adminResource.updateRole(selectedRole.value.id, values)
    await refreshRoles()
    toast.add({
      title: 'Zapisano rolę',
      description: 'Zmiany zostały zapisane',
      color: 'success'
    })
  } catch (error: unknown) {
    editForm.setErrorsFromApi(error)
  } finally {
    savingRole.value = false
  }
}

async function updatePermissions() {
  if (!selectedRole.value) {
    return
  }
  savingPermissions.value = true
  try {
    await adminResource.updateRolePermissions(selectedRole.value.id, selectedPermissions.value)
    await refreshRoles()
    toast.add({
      title: 'Zapisano uprawnienia',
      description: 'Uprawnienia zostały zaktualizowane',
      color: 'success'
    })
  } catch (error: unknown) {
    editForm.setErrorsFromApi(error)
  } finally {
    savingPermissions.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">
        Role i uprawnienia
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Zarządzaj rolami oraz przypisanymi uprawnieniami.
      </p>
    </div>

    <UCard>
      <UForm
        :schema="CreateRoleInputSchema"
        :state="createValues"
        @submit="createForm.handleSubmit(createRole)"
      >
        <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <UFormGroup
            label="Nazwa roli"
            name="name"
          >
            <UInput
              v-model="createValues.name"
              placeholder="np. editor"
            />
          </UFormGroup>
          <UFormGroup
            label="Opis"
            name="description"
          >
            <UInput
              v-model="createValues.description"
              placeholder="Opcjonalny opis"
            />
          </UFormGroup>
          <div class="flex items-end">
            <UButton
              type="submit"
              color="primary"
              :loading="createPending"
            >
              Dodaj rolę
            </UButton>
          </div>
        </div>
        <UAlert
          v-if="createError"
          color="error"
          variant="soft"
          class="mt-4"
          title="Błąd"
          :description="createError"
        />
      </UForm>
    </UCard>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
      <UCard>
        <div class="space-y-3">
          <p class="text-sm font-semibold">
            Role
          </p>
          <div
            v-if="rolesPending"
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            Ładowanie ról...
          </div>
          <div
            v-else
            class="space-y-2"
          >
            <UButton
              v-for="role in rolesList"
              :key="role.id"
              :color="role.id === selectedRoleId ? 'primary' : 'neutral'"
              variant="soft"
              block
              @click="selectedRoleId = role.id"
            >
              {{ role.name }}
            </UButton>
          </div>
        </div>
      </UCard>

      <RoleEditor
        :role="selectedRole"
        :form="editForm"
        :permissions="permissionsData || []"
        :selected-permissions="selectedPermissions"
        :saving-role="savingRole"
        :saving-permissions="savingPermissions"
        @submit="updateRole"
        @update:selected-permissions="selectedPermissions = $event"
        @save-permissions="updatePermissions"
      />
    </div>
  </div>
</template>
