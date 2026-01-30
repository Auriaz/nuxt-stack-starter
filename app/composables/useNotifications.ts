import { ref, computed, readonly } from 'vue'
import type { Notification, NotificationStats } from '#shared/types'
import { useNotificationsResource } from '~/composables/resources/useNotificationsResource'

export function useNotifications() {
  const auth = useAuth()
  const resource = useNotificationsResource()

  const notifications = ref<Notification[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const stats = computed<NotificationStats>(() => {
    const total = notifications.value.length
    const unread = notifications.value.filter(n => !n.read).length
    const read = total - unread
    return { total, unread, read }
  })

  const unreadCount = computed(() => stats.value.unread)

  const formatTime = (date: string): string => {
    const now = new Date()
    const notificationDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000)

    if (diffInSeconds < 60) return 'przed chwilą'
    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minutę' : diffInMinutes < 5 ? 'minuty' : 'minut'} temu`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'godzinę' : diffInHours < 5 ? 'godziny' : 'godzin'} temu`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'dzień' : 'dni'} temu`
    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'tydzień' : diffInWeeks < 5 ? 'tygodnie' : 'tygodni'} temu`
    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? 'miesiąc' : diffInMonths < 5 ? 'miesiące' : 'miesięcy'} temu`
    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears} ${diffInYears === 1 ? 'rok' : diffInYears < 5 ? 'lata' : 'lat'} temu`
  }

  const fetchNotifications = async (): Promise<Notification[]> => {
    if (!auth.isLoggedIn.value) {
      notifications.value = []
      return []
    }
    isLoading.value = true
    error.value = null
    try {
      const data = await resource.fetchNotifications()
      notifications.value = data.items
      return data.items
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udało się pobrać powiadomień'
      notifications.value = []
      return []
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (id: number): Promise<void> => {
    const notification = notifications.value.find(n => n.id === id)
    if (!notification || notification.read) return
    try {
      await resource.markAsRead(id)
      notification.read = true
    } catch (err: unknown) {
      if (notification) notification.read = false
      throw err
    }
  }

  const markAllAsRead = async (): Promise<void> => {
    const unread = notifications.value.filter(n => !n.read)
    if (unread.length === 0) return
    try {
      await resource.markAllAsRead()
      unread.forEach((n) => {
        n.read = true
      })
    } catch (err: unknown) {
      unread.forEach((n) => {
        n.read = false
      })
      throw err
    }
  }

  const deleteNotification = async (id: number): Promise<void> => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index === -1) return
    notifications.value.splice(index, 1)
  }

  const setupWebSocket = (): void => {
    // TODO: v2 WebSocket — useNotificationsSocket()
  }

  return {
    notifications: readonly(notifications),
    isLoading: readonly(isLoading),
    error: readonly(error),
    stats,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    formatTime,
    setupWebSocket
  }
}
