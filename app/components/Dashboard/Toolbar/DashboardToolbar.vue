<script lang="ts" setup>
// Wrapper dla UDashboardToolbar
</script>

<template>
  <UDashboardToolbar>
    <template #left>
      <slot name="left" />
    </template>

    <template #default>
      <slot />
    </template>

    <template #right>
      <slot name="right" />
    </template>
  </UDashboardToolbar>
</template>
