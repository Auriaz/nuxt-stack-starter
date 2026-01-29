<script setup lang="ts">
import type { PermissionDTO } from '#shared/types/auth'
import type { PermissionKey } from '#shared/permissions'

const props = defineProps<{
  permissions: PermissionDTO[]
  modelValue: PermissionKey[]
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: PermissionKey[]): void
}>()

const groupedPermissions = computed(() => {
  const groups = new Map<string, PermissionDTO[]>()
  for (const permission of props.permissions) {
    const group = permission.group ?? 'Inne'
    const list = groups.get(group) ?? []
    list.push(permission)
    groups.set(group, list)
  }

  return Array.from(groups.entries()).map(([group, permissions]) => ({
    group,
    permissions: permissions.sort((a, b) => a.key.localeCompare(b.key))
  }))
})

const selected = computed({
  get: () => props.modelValue ?? [],
  set: (value: PermissionKey[]) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="group in groupedPermissions"
      :key="group.group"
      class="space-y-3"
    >
      <p class="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {{ group.group }}
      </p>
      <UCheckboxGroup
        v-model="selected"
        class="grid gap-2 md:grid-cols-2"
        :options="group.permissions.map(permission => ({
          label: permission.label ?? permission.key,
          value: permission.key
        }))"
      />
    </div>
  </div>
</template>
