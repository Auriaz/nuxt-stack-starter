<script lang="ts" setup>
import { useDashboardNavigation } from '~/composables/useDashboardNavigation'

defineProps<{
  collapsed: boolean
}>()

const { menuItems } = useDashboardNavigation()
</script>

<template>
  <div class="flex flex-col gap-4 flex-1 overflow-y-auto py-4">
    <!-- Search Button -->
    <div class="px-2">
      <UDashboardSearchButton
        :collapsed="collapsed"
        :kbds="['meta', 'K']"
        variant="outline"
        color="neutral"
        :block="true"
        :square="collapsed"
      />
    </div>

    <!-- Navigation Menu -->
    <UNavigationMenu
      :items="menuItems[0]"
      orientation="vertical"
      :collapsed="collapsed"
      class="px-2 data-[orientation=vertical]:w-full"
    />

    <UNavigationMenu
      :collapsed="collapsed"
      :items="menuItems[1]"
      orientation="vertical"
      class="mt-auto data-[orientation=vertical]:w-full"
    />
  </div>
</template>
