import { computed, readonly } from 'vue'
import { safeParse } from 'valibot'
import type { Notification, NotificationStats, NotificationsReadPayload } from '#shared/types'
import { MarkNotificationsReadInputSchema, NotificationSchema } from '#shared/schemas/notification'
import { useNotificationsResource } from '~/composables/resources/useNotificationsResource'
import { useNotificationsSocket } from '~/composables/useNotificationsSocket'

export function useNotifications() {
  const auth = useAuth()
  const resource = useNotificationsResource()

  const notifications = useState<Notification[]>('notifications', () => [])
  const isLoading = useState<boolean>('notificationsLoading', () => false)
  const error = useState<string | null>('notificationsError', () => null)

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

  const normalizeNotification = (raw: unknown): Notification | null => {
    if (!raw || typeof raw !== 'object') return null
    const obj = raw as Record<string, unknown>
    const mapped = {
      id: obj.id,
      type: obj.type,
      title: typeof obj.title === 'string' && obj.title.trim() ? obj.title : 'Powiadomienie',
      message: typeof obj.message === 'string' ? obj.message : '',
      read: typeof obj.read === 'boolean' ? obj.read : false,
      created_at: obj.created_at ?? obj.createdAt,
      action_url: obj.action_url ?? obj.actionUrl
    }
    const parsed = safeParse(NotificationSchema, mapped)
    if (!parsed.success) return null
    return parsed.output
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
      const normalized = Array.isArray(data.items)
        ? data.items.map(item => normalizeNotification(item)).filter((item): item is Notification => !!item)
        : []
      notifications.value = normalized
      return normalized
    } catch (err: unknown) {
      error.value = err instanceof Error ? err.message : 'Nie udało się pobrać powiadomień'
      return notifications.value
    } finally {
      isLoading.value = false
    }
  }

  const markAsRead = async (id: number): Promise<void> => {
    if (id < 0) {
      const local = notifications.value.find(n => n.id === id)
      if (local) local.read = true
      return
    }
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
      const localOnly = unread.every(n => n.id < 0)
      if (!localOnly) {
        await resource.markAllAsRead()
      }
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

  const addLocalNotification = (input: { title: string, message: string, actionUrl?: string, type?: Notification['type'] }) => {
    const localId = -1 * Date.now()
    const newNotification: Notification = {
      id: localId,
      type: input.type ?? 'info',
      title: input.title,
      message: input.message,
      read: false,
      created_at: new Date().toISOString(),
      action_url: input.actionUrl
    }
    notifications.value.unshift(newNotification)
    const localIds = notifications.value.filter(item => item.id < 0).map(item => item.id)
    if (localIds.length > 50) {
      const toRemove = localIds.slice(50)
      notifications.value = notifications.value.filter(item => !toRemove.includes(item.id))
    }
  }

  const clearLocalByAction = (actionPrefix: string) => {
    notifications.value = notifications.value.filter((item) => {
      if (item.id >= 0) return true
      return !item.action_url?.startsWith(actionPrefix)
    })
  }

  const applyReadPayload = (payload: NotificationsReadPayload) => {
    if (payload.all) {
      notifications.value.forEach((notification) => {
        notification.read = true
      })
      return
    }
    if (!payload.ids || payload.ids.length === 0) return
    const ids = new Set(payload.ids)
    notifications.value.forEach((notification) => {
      if (ids.has(notification.id)) {
        notification.read = true
      }
    })
  }

  const setupWebSocket = (): (() => void) => {
    if (!auth.isLoggedIn.value) {
      return () => { }
    }
    const socket = useNotificationsSocket()
    socket.connect()

    const stop = socket.onEvent((event) => {
      if (event.type === 'notification.new') {
        const incoming = normalizeNotification(event.payload)
        if (!incoming) return
        const existingIndex = notifications.value.findIndex(item => item.id === incoming.id)
        if (existingIndex >= 0) {
          notifications.value[existingIndex] = incoming
        } else {
          notifications.value.unshift(incoming)
        }
        return
      }

      if (event.type === 'notifications.read') {
        const parsed = safeParse(MarkNotificationsReadInputSchema, event.payload ?? {})
        if (!parsed.success) return
        applyReadPayload({ ids: parsed.output.ids, all: parsed.output.all })
      }
    })

    return () => {
      stop()
    }
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
    addLocalNotification,
    clearLocalByAction,
    formatTime,
    setupWebSocket
  }
}
