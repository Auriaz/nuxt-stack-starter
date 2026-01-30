<script lang="ts" setup>
// TODO: Implementuj powiadomienia i menu użytkownika
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Notifications -->
    <UPopover
      :popper="{ placement: 'bottom-end' }"
    >
      <UButton
        icon="i-lucide-bell"
        variant="ghost"
        color="neutral"
        size="sm"
      />

      <template #content>
        <div class="p-2 w-80">
          <div class="px-3 py-2 border-b border-default">
            <h3 class="font-semibold text-sm">
              Powiadomienia
            </h3>
          </div>
          <div class="py-2">
            <p class="text-sm text-muted text-center py-4">
              Brak nowych powiadomień
            </p>
          </div>
        </div>
      </template>
    </UPopover>

    <!-- User Menu -->
    <slot />
  </div>
</template>
