<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Powiadomienia - Dashboard',
  description: 'Lista powiadomień'
})

const { notifications, fetchNotifications, isLoading, markAsRead, formatTime } = useNotifications()

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <DashboardPanel
    title="Powiadomienia"
    icon="i-lucide-bell"
  >
    <template #body>
      <div
        v-if="isLoading && notifications.length === 0"
        class="flex justify-center py-12"
      >
        <UIcon
          name="i-lucide-loader-2"
          class="w-8 h-8 animate-spin text-primary-500"
        />
      </div>
      <div
        v-else-if="notifications.length === 0"
        class="py-12 text-center text-basic-500 dark:text-basic-400"
      >
        <UIcon
          name="i-lucide-bell-off"
          class="w-12 h-12 mx-auto mb-2 opacity-50"
        />
        <p>Brak powiadomień</p>
      </div>
      <div
        v-else
        class="divide-y divide-basic-200 dark:divide-basic-700"
      >
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="flex items-start gap-3 py-4 px-2 hover:bg-basic-50 dark:hover:bg-basic-800/50 rounded-lg transition-colors"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-basic-900 dark:text-basic-100">
              {{ notification.title }}
            </p>
            <p class="text-sm text-basic-600 dark:text-basic-400 mt-0.5">
              {{ notification.message }}
            </p>
            <p class="text-xs text-basic-500 dark:text-basic-500 mt-1">
              {{ formatTime(notification.created_at) }}
            </p>
          </div>
          <UButton
            v-if="!notification.read"
            variant="ghost"
            size="xs"
            @click="markAsRead(notification.id)"
          >
            Oznacz jako przeczytane
          </UButton>
        </div>
      </div>
    </template>
  </DashboardPanel>
</template>
