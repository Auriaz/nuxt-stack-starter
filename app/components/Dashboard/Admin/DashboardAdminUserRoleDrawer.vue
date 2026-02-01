<script lang="ts" setup>
import type { UserDTO, RoleDTO } from '#shared/types/auth'

const props = defineProps<{
  open: boolean
  user: UserDTO | null
  roles: RoleDTO[]
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  saved: [roleId: number]
}>()

const selectedRoleId = ref<number | null>(null)

watch(
  () => props.user,
  (user) => {
    if (user?.roleId != null) {
      selectedRoleId.value = user.roleId
    } else {
      const roleByName = props.roles.find(r => r.name === user?.role)
      selectedRoleId.value = roleByName?.id ?? null
    }
  },
  { immediate: true }
)

watch(
  () => props.open,
  (open) => {
    if (open && props.user) {
      const roleByName = props.roles.find(r => r.name === props.user?.role)
      selectedRoleId.value = props.user.roleId ?? roleByName?.id ?? null
    }
  }
)

const roleOptions = computed(() =>
  props.roles.map(r => ({ label: r.name, value: r.id }))
)

function onClose() {
  emit('close')
}

function onSubmit() {
  if (selectedRoleId.value != null) {
    emit('saved', selectedRoleId.value)
  }
}
</script>

<template>
  <USlideover
    :model-value="open"
    @update:model-value="(v: boolean) => !v && onClose()"
  >
    <template #content>
      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-lg font-semibold">
            Edytuj rolę użytkownika
          </h2>
          <p
            v-if="user"
            class="mt-1 text-sm text-neutral-500 dark:text-neutral-400"
          >
            {{ user.email ?? user.username ?? `#${user.id}` }}
          </p>
        </div>

        <UFormField
          label="Rola"
          name="roleId"
        >
          <USelect
            :model-value="selectedRoleId ?? undefined"
            :items="roleOptions"
            :disabled="loading"
            @update:model-value="selectedRoleId = $event ?? null"
          />
        </UFormField>

        <div class="flex gap-2 justify-end">
          <UButton
            variant="ghost"
            color="neutral"
            @click="onClose"
          >
            Anuluj
          </UButton>
          <UButton
            color="primary"
            :loading="loading"
            :disabled="selectedRoleId == null"
            @click="onSubmit"
          >
            Zapisz
          </UButton>
        </div>
      </div>
    </template>
  </USlideover>
</template>
