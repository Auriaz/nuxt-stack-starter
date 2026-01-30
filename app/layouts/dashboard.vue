<script lang="ts" setup>
import { useDashboardSearch } from '~/composables/useDashboardSearch'

const { groups } = useDashboardSearch()
</script>

<template>
  <UDashboardGroup
    storage="cookie"
    storage-key="dashboard"
    :persistent="true"
  >
    <!-- Sidebar -->
    <DashboardSidebar />
    <!-- Global Search -->
    <UDashboardSearch
      :groups="groups"
      shortcut="meta_k"
      :color-mode="true"
    />
    <!-- Main Content -->
    <slot />
  </UDashboardGroup>
</template>
