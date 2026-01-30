<script lang="ts" setup>
import { onMounted, computed } from 'vue'
import type { Notification } from '#shared/types'
import { useNotifications } from '~/composables/useNotifications'

const { notifications, unreadCount, fetchNotifications, isLoading } = useNotifications()

// Konwertuj readonly array na mutable array dla komponentu
const mutableNotifications = computed(() => [...notifications.value])

// Pobierz powiadomienia przy pierwszym otwarciu (lazy loading)
const handleOpen = async () => {
  if (notifications.value.length === 0 && !isLoading.value) {
    await fetchNotifications()
  }
}

// Pobierz powiadomienia przy montowaniu komponentu (opcjonalnie - można zmienić na lazy)
onMounted(async () => {
  // Lazy loading - pobierz tylko gdy użytkownik otworzy dropdown
  // Jeśli chcesz pobierać od razu, odkomentuj poniższą linię:
  // await fetchNotifications()
})

const handleNotificationClick = (notification: Notification) => {
  // Opcjonalnie: przekieruj do szczegółów powiadomienia
  if (notification.action_url) {
    navigateTo(notification.action_url)
  }
}
</script>

<template>
  <UPopover
    :popper="{ placement: 'bottom-end', offset: 8 }"
    @open="handleOpen"
  >
    <UButton
      variant="ghost"
      color="neutral"
      size="sm"
      square
      :aria-label="`Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ''}`"
      class="relative"
    >
      <UIcon
        name="i-heroicons-bell"
        class="h-5 w-5 text-basic-600 dark:text-basic-400"
      />
      <UBadge
        v-if="unreadCount > 0"
        :label="unreadCount > 99 ? '99+' : unreadCount.toString()"
        color="error"
        variant="solid"
        class="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-1 text-xs font-semibold"
      />
    </UButton>

    <template #content>
      <DashboardNotificationsList
        :notifications="mutableNotifications"
        @click="handleNotificationClick"
        @mark-as-read="() => {}"
        @mark-all-read="() => {}"
      />
    </template>
  </UPopover>
</template>
