<script lang="ts" setup>
defineProps<{
  title: string
  icon?: string
}>()

const open = ref(false)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :title="title"
        :icon="icon"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <slot name="right" />
          <UDashboardToolbar :ui="{ root: 'border-none' }">
            <template #left>
              <div class="flex items-center justify-center gap-2">
                <slot name="left" />
                <ColorModeButton />
              </div>
            </template>
            <template #right>
              <div class="flex items-center gap-2">
                <DashboardNotificationsBell />
                <ChatButton />
                <UButton
                  size="sm"
                  square
                  variant="ghost"
                  icon="i-lucide-sidebar"
                  color="neutral"
                  @click="open = true"
                />
              </div>
            </template>
          </UDashboardToolbar>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <slot name="body" />

      <USlideover v-model:open="open">
        <template #content>
          <div class="w-full p-4 border-t border-neutral-300 dark:border-neutral-700 overflow-y-auto">
            <slot name="sidebar" />
          </div>
        </template>
      </USlideover>
    </template>

    <template #footer>
      <slot name="footer" />
    </template>
  </UDashboardPanel>
</template>
