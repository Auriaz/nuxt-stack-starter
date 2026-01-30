/**
 * Composable do aktywności użytkownika (logi, statystyki).
 * Komunikacja z API: GET /api/profile/activity/logs, GET /api/profile/activity/stats.
 */

import type { ActivityLogItem, ActivityStats } from '#shared/types'
import { useApiClient } from '~/composables/resources/useApiClient'

const logs = ref<ActivityLogItem[]>([])
const stats = ref<ActivityStats>({ total_actions: 0 })
const isLoading = ref(false)

const ACTION_MAP: Record<string, { label: string, icon: string, color: string }> = {
  login: { label: 'Logowanie', icon: 'i-heroicons-arrow-right-on-rectangle', color: 'success' },
  logout: { label: 'Wylogowanie', icon: 'i-heroicons-arrow-left-on-rectangle', color: 'warning' },
  password_change: { label: 'Zmiana hasła', icon: 'i-heroicons-key', color: 'info' },
  profile_update: { label: 'Aktualizacja profilu', icon: 'i-heroicons-user-circle', color: 'primary' },
  default: { label: 'Akcja', icon: 'i-heroicons-bolt', color: 'basic' }
}

function getActionLabel(action: string): string {
  return ACTION_MAP[action]?.label ?? ACTION_MAP.default.label
}

function getActionIcon(action: string): string {
  return ACTION_MAP[action]?.icon ?? ACTION_MAP.default.icon
}

function getActionColor(action: string): string {
  return ACTION_MAP[action]?.color ?? ACTION_MAP.default.color
}

async function fetchLogs(): Promise<void> {
  isLoading.value = true
  try {
    const apiClient = useApiClient()
    const data = await apiClient.request<ActivityLogItem[]>('/api/profile/activity/logs')
    logs.value = Array.isArray(data) ? data : []
  } catch {
    logs.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchStats(): Promise<void> {
  try {
    const apiClient = useApiClient()
    const data = await apiClient.request<ActivityStats>('/api/profile/activity/stats')
    stats.value = data ?? { total_actions: 0 }
  } catch {
    stats.value = { total_actions: 0 }
  }
}

export function useProfileActivity() {
  return {
    logs: readonly(logs),
    stats: readonly(stats),
    isLoading: readonly(isLoading),
    fetchLogs,
    fetchStats,
    getActionLabel,
    getActionIcon,
    getActionColor
  }
}
