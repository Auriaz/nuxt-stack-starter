<script setup lang="ts">
import { UpdateRoleInputSchema } from '#shared/schemas/admin'
import type { RoleDTO, PermissionDTO } from '#shared/types/auth'
import type { PermissionKey } from '#shared/permissions'
import type { UseFormReturn } from '~/composables/useForm'

const props = defineProps<{
  role: RoleDTO | null
  form: UseFormReturn<typeof UpdateRoleInputSchema>
  permissions: PermissionDTO[]
  selectedPermissions: PermissionKey[]
  savingRole: boolean
  savingPermissions: boolean
}>()

const emit = defineEmits<{
  (event: 'submit', values: { name?: string, description?: string | null }): void
  (event: 'update:selectedPermissions', value: PermissionKey[]): void
  (event: 'savePermissions'): void
}>()

const onSubmit = props.form.handleSubmit(values => emit('submit', values))
const formValues = props.form.values
const formError = props.form.formError
</script>

<template>
  <UCard>
    <div class="space-y-6">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">
          {{ role ? `Edycja roli: ${role.name}` : 'Wybierz rolę' }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Zarządzaj nazwą roli i przypisanymi uprawnieniami.
        </p>
      </div>

      <UAlert
        v-if="!role"
        color="neutral"
        variant="soft"
        title="Brak wybranej roli"
        description="Wybierz rolę z listy po lewej, aby rozpocząć edycję."
      />

      <div
        v-else
        class="space-y-8"
      >
        <UForm
          :schema="UpdateRoleInputSchema"
          :state="formValues"
          @submit="onSubmit"
        >
          <div class="space-y-4">
            <UFormGroup
              label="Nazwa roli"
              name="name"
            >
              <UInput
                v-model="formValues.name"
                placeholder="np. editor"
              />
            </UFormGroup>
            <UFormGroup
              label="Opis"
              name="description"
            >
              <UTextarea
                v-model="formValues.description"
                placeholder="Opis roli"
              />
            </UFormGroup>
            <UAlert
              v-if="formError"
              color="error"
              variant="soft"
              title="Błąd"
              :description="formError"
            />
            <UButton
              type="submit"
              color="primary"
              :loading="savingRole"
            >
              Zapisz szczegóły roli
            </UButton>
          </div>
        </UForm>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold">
              Uprawnienia
            </h3>
            <UButton
              color="primary"
              variant="soft"
              :loading="savingPermissions"
              @click="emit('savePermissions')"
            >
              Zapisz uprawnienia
            </UButton>
          </div>
          <PermissionsPicker
            :permissions="permissions"
            :model-value="selectedPermissions"
            @update:model-value="emit('update:selectedPermissions', $event)"
          />
        </div>
      </div>
    </div>
  </UCard>
</template>
