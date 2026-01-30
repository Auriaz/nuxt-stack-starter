<script lang="ts" setup>
defineProps<{
  title: string
  icon?: string
}>()
</script>

<template>
  <UDashboardNavbar>
    <template #leading>
      <slot name="leading">
        <UDashboardSidebarCollapse />
      </slot>
    </template>

    <template #default>
      <div class="flex items-center gap-3">
        <UIcon
          v-if="icon"
          :name="icon"
          class="w-5 h-5 text-primary"
        />
        <h1 class="text-xl font-semibold">
          {{ title }}
        </h1>
        <slot />
      </div>
    </template>

    <template #right>
      <slot name="right" />
    </template>
  </UDashboardNavbar>
</template>
