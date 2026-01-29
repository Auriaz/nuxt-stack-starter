<script setup lang="ts">
import type { PermissionKey } from '#shared/permissions'

const props = defineProps<{
  permission?: PermissionKey
  role?: string
  invert?: boolean
}>()

const { can, hasRole } = useAccess()

const isAllowed = computed(() => {
  let allowed = false
  if (props.permission) {
    allowed = can(props.permission)
  } else if (props.role) {
    allowed = hasRole(props.role)
  }
  return props.invert ? !allowed : allowed
})
</script>

<template>
  <slot v-if="isAllowed" />
</template>
