<script setup lang="ts">
import { AssignUserRolesSchema } from '#shared/schemas/admin'
import { PERMISSIONS } from '#shared/permissions'
import type { UserDTO, RoleDTO } from '#shared/types/auth'
import { useAdminResource } from '~/composables/resources/useAdminResource'
import type { ComputedRef } from 'vue'

definePageMeta({
  middleware: 'auth',
  permission: PERMISSIONS.ADMIN_ACCESS
})

const adminResource = useAdminResource()
const toast = useToast()

const { data: usersData, pending: usersPending, refresh: refreshUsers } = useAsyncData<UserDTO[]>(
  'admin-users',
  () => adminResource.getUsers()
)
const { data: rolesData } = useAsyncData<RoleDTO[]>(
  'admin-roles',
  () => adminResource.getRoles()
)

const roleOptions = computed(() => {
  return (rolesData.value ?? []).map(role => ({ label: role.name, value: role.id }))
})

const roleIdByName = computed(() => new Map((rolesData.value ?? []).map(role => [role.name, role.id])))

type RowForm = {
  user: UserDTO
  form: ReturnType<typeof useForm>
  values: ComputedRef<ReturnType<typeof useForm>['values']['value']>
  pending: ComputedRef<boolean>
  formError: ComputedRef<string | null>
}

const rowForms = ref<RowForm[]>([])

watch(
  [usersData, roleIdByName],
  ([users]) => {
    if (!users) {
      rowForms.value = []
      return
    }

    rowForms.value = users.map((user) => {
      const roleId = roleIdByName.value.get(user.role)
      const form = useForm(AssignUserRolesSchema, {
        initialValues: {
          roleId: roleId ?? 0
        }
      })
      form.setValues({ roleId: roleId ?? 0 })
      return {
        user,
        form,
        values: computed(() => form.values.value),
        pending: computed(() => form.pending.value),
        formError: computed(() => form.formError.value)
      }
    })
  },
  { immediate: true }
)

const handleRowSubmit = (index: number) => {
  const row = rowForms.value[index]
  if (!row) {
    return
  }

  return row.form.handleSubmit(async (values) => {
    try {
      await adminResource.updateUserRole(row.user.id, values.roleId)
      await refreshUsers()
      toast.add({
        title: 'Zapisano',
        description: 'Zaktualizowano rolę użytkownika',
        color: 'success'
      })
    } catch (error: unknown) {
      row.form.setErrorsFromApi(error)
    }
  })
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold tracking-tight">
        Użytkownicy
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Zarządzaj rolami przypisanymi do kont użytkowników.
      </p>
    </div>

    <UCard>
      <div class="space-y-4">
        <div
          v-if="usersPending"
          class="text-sm text-gray-500 dark:text-gray-400"
        >
          Ładowanie użytkowników...
        </div>
        <div
          v-else
          class="space-y-3"
        >
          <div
            v-for="(row, index) in rowForms"
            :key="row.user.id"
            class="flex flex-col gap-3 border-b border-gray-100 pb-4 last:border-none dark:border-gray-800"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium">
                  {{ row.user.email || row.user.username || `Użytkownik #${row.user.id}` }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  Aktualna rola: {{ row.user.role }}
                </p>
              </div>
            </div>
            <UForm
              :schema="AssignUserRolesSchema"
              :state="row.values"
              @submit="handleRowSubmit(index)"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-end">
                <UFormGroup
                  label="Rola"
                  name="roleId"
                  class="flex-1"
                >
                  <USelect
                    v-model="row.values.roleId"
                    :options="roleOptions"
                  />
                </UFormGroup>
                <UButton
                  type="submit"
                  color="primary"
                  :loading="row.pending"
                >
                  Zapisz zmiany
                </UButton>
              </div>
              <UAlert
                v-if="row.formError"
                color="error"
                variant="soft"
                class="mt-3"
                title="Błąd"
                :description="row.formError"
              />
            </UForm>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
