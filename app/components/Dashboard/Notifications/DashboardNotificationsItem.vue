<script lang="ts" setup>
import type { Notification } from '#shared/types'
import { useNotifications } from '~/composables/useNotifications'

interface Props {
  notification: Notification
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'click': [notification: Notification]
  'mark-as-read': [id: number]
}>()

const { formatTime, markAsRead } = useNotifications()

const getTypeColor = (type: Notification['type']): string => {
  const colors: Record<Notification['type'], string> = {
    info: 'text-info-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    error: 'text-error-500'
  }
  return colors[type] || colors.info
}

const getTypeBgColor = (type: Notification['type']): string => {
  const colors: Record<Notification['type'], string> = {
    info: 'bg-info-50 dark:bg-info-900/20 border-info-200 dark:border-info-800',
    success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
    warning: 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800',
    error: 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
  }
  return colors[type] || colors.info
}

const getTypeIcon = (type: Notification['type']): string => {
  const icons: Record<Notification['type'], string> = {
    info: 'i-heroicons-information-circle',
    success: 'i-heroicons-check-circle',
    warning: 'i-heroicons-exclamation-triangle',
    error: 'i-heroicons-x-circle'
  }
  return icons[type] || icons.info
}

const handleClick = () => {
  if (!props.notification.read) {
    markAsRead(props.notification.id)
    emit('mark-as-read', props.notification.id)
  }
  emit('click', props.notification)
}

const handleMarkAsRead = async (e: Event) => {
  e.stopPropagation()
  if (!props.notification.read) {
    await markAsRead(props.notification.id)
    emit('mark-as-read', props.notification.id)
  }
}
</script>

<template>
  <div
    :class="[
      'group relative flex items-start gap-3 rounded-lg border p-4 transition-all duration-200 cursor-pointer',
      getTypeBgColor(notification.type),
      notification.read
        ? 'opacity-75 hover:opacity-100'
        : 'hover:shadow-md hover:scale-[1.02]'
    ]"
    @click="handleClick"
  >
    <!-- Wskaźnik nieprzeczytane -->
    <div
      v-if="!notification.read"
      :class="[
        'absolute left-0 top-0 h-full w-1 rounded-l-lg',
        notification.type === 'info' ? 'bg-info-500'
        : notification.type === 'success' ? 'bg-success-500'
          : notification.type === 'warning' ? 'bg-warning-500'
            : 'bg-error-500'
      ]"
    />

    <!-- Ikona typu -->
    <div
      :class="[
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
        notification.type === 'info' ? 'bg-info-100 dark:bg-info-900/30'
        : notification.type === 'success' ? 'bg-success-100 dark:bg-success-900/30'
          : notification.type === 'warning' ? 'bg-warning-100 dark:bg-warning-900/30'
            : 'bg-error-100 dark:bg-error-900/30'
      ]"
    >
      <UIcon
        :name="getTypeIcon(notification.type)"
        :class="[
          'h-5 w-5',
          getTypeColor(notification.type)
        ]"
      />
    </div>

    <!-- Treść powiadomienia -->
    <div class="flex-1 min-w-0">
      <div class="flex items-start justify-between gap-2">
        <h4
          :class="[
            'text-sm font-semibold',
            notification.read
              ? 'text-basic-600 dark:text-basic-400'
              : 'text-basic-900 dark:text-basic-100'
          ]"
        >
          {{ notification.title }}
        </h4>
        <button
          v-if="!notification.read"
          :class="[
            'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-basic-100 dark:hover:bg-basic-800',
            getTypeColor(notification.type)
          ]"
          aria-label="Oznacz jako przeczytane"
          @click="handleMarkAsRead"
        >
          <UIcon
            name="i-heroicons-check"
            class="h-4 w-4"
          />
        </button>
      </div>
      <p
        :class="[
          'mt-1 text-sm line-clamp-2',
          notification.read
            ? 'text-basic-500 dark:text-basic-500'
            : 'text-basic-700 dark:text-basic-300'
        ]"
      >
        {{ notification.message }}
      </p>
      <div class="mt-2 flex items-center gap-2">
        <span class="text-xs text-basic-500 dark:text-basic-400">
          {{ formatTime(notification.created_at) }}
        </span>
        <span
          v-if="!notification.read"
          class="h-2 w-2 rounded-full bg-primary-500"
        />
      </div>
    </div>
  </div>
</template>
