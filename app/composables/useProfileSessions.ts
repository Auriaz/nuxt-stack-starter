/**
 * Composable do sesji użytkownika (lista sesji, ostatnie logowania).
 * Komunikacja z API: GET /api/profile/sessions, GET /api/profile/recent-logins, POST /api/profile/sessions/logout-others.
 */

import type { Session, RecentLogin } from '#shared/types'
import { useApiClient } from '~/composables/resources/useApiClient'

const sessions = ref<Session[]>([])
const recentLogins = ref<RecentLogin[]>([])
const isLoading = ref(false)

const currentSession = computed<Session | null>(() => {
  return sessions.value[0] ?? null
})

const otherSessions = computed<Session[]>(() => {
  return sessions.value.slice(1)
})

async function fetchSessions(): Promise<void> {
  isLoading.value = true
  try {
    const apiClient = useApiClient()
    const data = await apiClient.request<Session[]>('/api/profile/sessions')
    sessions.value = Array.isArray(data) ? data : []
  } catch {
    sessions.value = []
  } finally {
    isLoading.value = false
  }
}

async function fetchRecentLogins(): Promise<void> {
  isLoading.value = true
  try {
    const apiClient = useApiClient()
    const data = await apiClient.request<RecentLogin[]>('/api/profile/recent-logins')
    recentLogins.value = Array.isArray(data) ? data : []
  } catch {
    recentLogins.value = []
  } finally {
    isLoading.value = false
  }
}

async function logoutOtherSessions(): Promise<boolean> {
  try {
    const apiClient = useApiClient()
    await apiClient.request<{ ok: boolean }>('/api/profile/sessions/logout-others', { method: 'POST' })
    await fetchSessions()
    return true
  } catch {
    return false
  }
}

export function useProfileSessions() {
  return {
    sessions: readonly(sessions),
    recentLogins: readonly(recentLogins),
    currentSession,
    otherSessions,
    isLoading: readonly(isLoading),
    fetchSessions,
    fetchRecentLogins,
    logoutOtherSessions
  }
}
