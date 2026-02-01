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
    permissions: [...permissions].sort((a, b) => a.key.localeCompare(b.key))
  }))
})

const selected = computed({
  get: () => props.modelValue ?? [],
  set: (value: PermissionKey[]) => emit('update:modelValue', value)
})

/** Dla danej grupy: aktualna lista zaznaczonych kluczy z tej grupy */
function selectedForGroup(groupKeys: PermissionKey[]): PermissionKey[] {
  const current = selected.value
  return current.filter(k => groupKeys.includes(k))
}

/** Po zmianie zaznaczenia w grupie: scal z zaznaczeniami z innych grup */
function onGroupChange(groupKeys: PermissionKey[], newGroupSelected: PermissionKey[]) {
  const fromOtherGroups = selected.value.filter(k => !groupKeys.includes(k))
  emit('update:modelValue', [...fromOtherGroups, ...newGroupSelected])
}

/** Elementy dla UCheckboxGroup (Nuxt UI v4 używa :items) */
function itemsForGroup(permissions: PermissionDTO[]) {
  return permissions.map(p => ({
    label: p.label ?? p.key,
    value: p.key
  }))
}
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="group in groupedPermissions"
      :key="group.group"
      class="space-y-3"
    >
      <p class="text-xs font-medium uppercase tracking-wide text-muted">
        {{ group.group }}
      </p>
      <UCheckboxGroup
        :model-value="selectedForGroup(group.permissions.map(p => p.key))"
        :items="itemsForGroup(group.permissions)"
        class="grid gap-2 md:grid-cols-2"
        variant="list"
        @update:model-value="onGroupChange(group.permissions.map(p => p.key), $event)"
      />
    </div>
  </div>
</template>
