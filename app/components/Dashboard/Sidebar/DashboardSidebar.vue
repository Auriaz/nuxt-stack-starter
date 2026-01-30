<script lang="ts" setup>
defineProps({
  resizable: {
    type: Boolean,
    default: true
  },
  collapsible: {
    type: Boolean,
    default: true
  },
  defaultSize: {
    type: Number,
    default: 15
  },
  minSize: {
    type: Number,
    default: 10
  },
  maxSize: {
    type: Number,
    default: 25
  }
})
</script>

<template>
  <UDashboardSidebar
    :default-size="defaultSize"
    :min-size="minSize"
    :max-size="maxSize"
    :collapsed-size="4"
    collapsible
    resizable
    :ui="{ footer: 'border-t border-default' }"
  >
    <template #header="{ collapsed }">
      <DashboardSidebarHeader :collapsed="Boolean(collapsed)" />
    </template>

    <template #default="{ collapsed }">
      <DashboardSidebarMenu :collapsed="Boolean(collapsed)" />
    </template>

    <template #footer="{ collapsed }">
      <DashboardSidebarFooter :collapsed="collapsed || false" />
    </template>
  </UDashboardSidebar>
</template>
