<script lang="ts" setup>
import type { Notification } from '#shared/types'
import { useNotifications } from '~/composables/useNotifications'

interface Props {
  notifications: Notification[]
}

defineProps<Props>()

const emit = defineEmits<{
  'mark-as-read': [id: number]
  'mark-all-read': []
  'click': [notification: Notification]
}>()

const { markAllAsRead, unreadCount } = useNotifications()
const isMarkingAll = ref(false)

const handleMarkAllAsRead = async () => {
  if (unreadCount.value === 0) {
    return
  }

  isMarkingAll.value = true
  try {
    await markAllAsRead()
    emit('mark-all-read')
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Failed to mark all as read:', error)
  } finally {
    isMarkingAll.value = false
  }
}

const handleMarkAsRead = (id: number) => {
  emit('mark-as-read', id)
}

const handleClick = (notification: Notification) => {
  emit('click', notification)
}
</script>

<template>
  <div class="flex flex-col w-full max-w-sm">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-basic-200 dark:border-basic-700 px-4 py-3">
      <h3 class="text-sm font-semibold text-basic-900 dark:text-basic-100">
        Powiadomienia
      </h3>
      <UButton
        v-if="unreadCount > 0"
        variant="ghost"
        color="primary"
        size="xs"
        :loading="isMarkingAll"
        :disabled="isMarkingAll"
        class="text-xs"
        @click="handleMarkAllAsRead"
      >
        Oznacz wszystkie
      </UButton>
    </div>

    <!-- Lista powiadomień -->
    <div
      v-if="notifications.length > 0"
      class="max-h-96 overflow-y-auto"
    >
      <div class="p-2 space-y-2">
        <DashboardNotificationItem
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @click="handleClick"
          @mark-as-read="handleMarkAsRead"
        />
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <UIcon
        name="i-heroicons-bell-slash"
        class="h-12 w-12 text-basic-400 dark:text-basic-600 mb-3"
      />
      <p class="text-sm font-medium text-basic-900 dark:text-basic-100 mb-1">
        Brak powiadomień
      </p>
      <p class="text-xs text-basic-500 dark:text-basic-400">
        Nie masz żadnych nowych powiadomień
      </p>
    </div>

    <!-- Footer (opcjonalny link do wszystkich powiadomień) -->
    <!-- TODO: Dodaj stronę /dashboard/notifications gdy będzie potrzebna -->
    <!--
    <div
      v-if="notifications.length > 0"
      class="border-t border-basic-200 dark:border-basic-700 px-4 py-2"
    >
      <UButton
        variant="ghost"
        color="primary"
        size="sm"
        block
        class="text-xs"
        to="/dashboard/notifications"
      >
        Zobacz wszystkie powiadomienia
      </UButton>
    </div>
    -->
  </div>
</template>
