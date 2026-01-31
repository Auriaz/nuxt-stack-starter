<script lang="ts" setup>
import type { SecurityInfo } from '#shared/types'
import DashboardProfileSecurity2FA from '~/components/Dashboard/Profile/Security/DashboardProfileSecurity2FA.vue'
import { useProfile } from '~/composables/resources/useProfile'
import { useProfile2FA } from '~/composables/resources/useProfile2FA'

/** Kształt danych content/stats z useProfile (API profile/content, profile/stats) */
interface ProfileContentItem { id?: unknown, title?: string, description?: string, createdAt?: string, timestamp?: string, status?: string }
interface ProfileContent {
  recent_articles?: ProfileContentItem[]
  recent_media?: ProfileContentItem[]
  recent_comments?: ProfileContentItem[]
  stats?: { total_articles?: number, total_media?: number, total_comments?: number }
}

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Profil - Dashboard - Web Space',
  description: 'Profil użytkownika'
})

const { profile, stats, content, fetchProfile, fetchSecurity, fetchStats, fetchContent } = useProfile()
const { sessions, recentLogins, currentSession, otherSessions, fetchSessions, fetchRecentLogins, logoutOtherSessions, isLoading: isLoadingSessions } = useProfileSessions()
const { status: twoFactorStatus, fetchStatus: fetchTwoFactorStatus } = useProfile2FA()
const toast = useToast()
const { logs: activityLogs, isLoading: isLoadingActivity, fetchLogs: fetchActivityLogs, fetchStats: fetchActivityStats, getActionLabel, getActionIcon, getActionColor } = useProfileActivity()
const route = useRoute()
const router = useRouter()

const securityInfo = ref<SecurityInfo | null>(null)

/** Lista kroków bezpieczeństwa (Overview + Security): hasło, email, 2FA – wartości z API/useProfile2FA */
const securityChecklist = computed(() => {
  const emailOk = !!profileForView.value?.email_verified_at || !!securityInfo.value?.email_verified
  const passwordOk = securityInfo.value?.password_strength === 'strong'
  const twoFactorOk = twoFactorStatus.value?.enabled ?? securityInfo.value?.two_factor_enabled ?? false
  return [
    { label: 'Strong password configured', done: passwordOk, icon: 'i-heroicons-key' },
    { label: 'Email verified', done: emailOk, icon: 'i-heroicons-envelope' },
    { label: 'Enable two-factor authentication', done: twoFactorOk, icon: 'i-heroicons-device-phone-mobile' }
  ]
})

/** Mapowanie ProfileDTO na kształt oczekiwany przez template (snake_case + fallbacki) */
const profileForView = computed(() => {
  const p = profile.value
  if (!p) return null
  const nameParts = (p.name || '').trim().split(/\s+/)
  const first_name = nameParts[0] ?? ''
  const last_name = nameParts.slice(1).join(' ') ?? ''
  return {
    ...p,
    avatar_url: p.avatarUrl,
    first_name,
    last_name,
    full_name: p.name || p.username || '',
    email_verified_at: p.emailVerifiedAt,
    profile_completeness: Math.min(100, [p.name, p.avatarUrl, p.email, p.bio].filter(Boolean).length * 25),
    profile_visibility: 'public' as const,
    roles: [{ slug: p.role, name: p.role }],
    created_at: undefined as string | undefined,
    updated_at: undefined as string | undefined,
    bio: p.bio,
    emailNotificationsNewMessages: false,
    emailNotificationsFriendRequests: false,
    emailNotificationsSystemUpdates: false
  }
})

const tabs = ref([
  {
    id: 'overview',
    label: 'Overview',
    icon: 'i-heroicons-home'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth'
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: 'i-heroicons-chart-bar'
  },
  {
    id: 'content',
    label: 'Content',
    icon: 'i-heroicons-document-text'
  },
  {
    id: 'privacy',
    label: 'Privacy',
    icon: 'i-heroicons-lock-closed'
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'i-heroicons-shield-check'
  },
  {
    id: 'account',
    label: 'Account',
    icon: 'i-heroicons-user-circle'
  }
])

// Funkcja do pobrania tab z query parametrów
const getTabFromQuery = (): string => {
  const tabParam = route.query.tab as string | undefined
  if (tabParam && tabs.value.some(tab => tab.id === tabParam)) {
    return tabParam
  }
  return 'overview'
}

const activeTab = ref(getTabFromQuery())

// Watch na zmianę query parametru tab
watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && tabs.value.some(tab => tab.id === newTab)) {
    activeTab.value = newTab
  }
}, { immediate: true })

// Watch na zmianę activeTab i aktualizacja URL
watch(activeTab, (newTab) => {
  if (route.query.tab !== newTab) {
    router.replace({
      query: {
        ...route.query,
        tab: newTab
      }
    })
  }
})

// Funkcje pomocnicze
const getTabColor = (tabId: string): string => {
  const colors: Record<string, string> = {
    overview: 'bg-primary-500',
    settings: 'bg-success-500',
    activity: 'bg-info-500',
    content: 'bg-purple-500',
    privacy: 'bg-warning-500',
    security: 'bg-error-500',
    account: 'bg-red-500'
  }
  return colors[tabId] || 'bg-primary-500'
}

const getRoleIcon = (role: string | undefined): string => {
  if (!role) return 'i-heroicons-user'
  const icons: Record<string, string> = {
    admin: 'i-heroicons-shield-check',
    moderator: 'i-heroicons-user-circle',
    editor: 'i-heroicons-pencil',
    user: 'i-heroicons-user'
  }
  return icons[role] ?? 'i-heroicons-user'
}

const getRoleName = (role: string | undefined): string => {
  if (!role) return 'Użytkownik'
  const names: Record<string, string> = {
    admin: 'Administrator',
    moderator: 'Moderator',
    editor: 'Redaktor',
    user: 'Użytkownik'
  }
  return names[role] ?? role
}

const getRoleColor = (role: string | undefined): string => {
  if (!role) return 'primary'
  const colors: Record<string, string> = {
    admin: 'error',
    moderator: 'warning',
    editor: 'info',
    user: 'primary'
  }
  return colors[role] || 'primary'
}

// Computed properties
const profileCompleteness = computed(() => {
  return profileForView.value?.profile_completeness ?? 0
})

/** Pełny URL avatara (origin + ścieżka), żeby UAvatar poprawnie ładował /api/media/:id/serve */
const profileAvatarSrc = useAvatarSrc(() => profileForView.value?.avatar_url ?? undefined)

const accountStatus = computed(() => {
  if (profileForView.value?.email_verified_at) {
    return {
      label: 'Zweryfikowane',
      icon: 'i-heroicons-check-circle',
      class: 'border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-900/20 dark:text-success-300'
    }
  }
  return {
    label: 'Niezweryfikowane',
    icon: 'i-heroicons-x-circle',
    class: 'border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-300'
  }
})

/** Status hasła (na podstawie GET /api/profile/security) */
const passwordStatusLabel = computed(() => {
  const s = securityInfo.value?.password_strength
  if (s === 'strong') return 'Silne i bezpieczne'
  if (s === 'consider_changing') return 'Rozważ zmianę'
  if (s === 'never_changed') return 'Nigdy nie zmieniane'
  return '—'
})

const passwordStatusClass = computed(() => {
  const s = securityInfo.value?.password_strength
  if (s === 'strong') return 'text-success-600 dark:text-success-400'
  if (s === 'consider_changing') return 'text-warning-600 dark:text-warning-400'
  if (s === 'never_changed') return 'text-info-600 dark:text-info-400'
  return 'text-basic-600 dark:text-basic-400'
})

/** Ostatnia zmiana hasła (np. "5 dni temu" lub "Nigdy") */
const lastPasswordChangeLabel = computed(() => {
  const days = securityInfo.value?.password_changed_days_ago
  if (days == null || securityInfo.value?.last_password_change == null) return 'Nigdy'
  if (days === 0) return 'Dzisiaj'
  if (days === 1) return 'Wczoraj'
  if (days < 7) return `${days} dni temu`
  if (days < 30) return `${Math.floor(days / 7)} tyg. temu`
  if (days < 365) return `${Math.floor(days / 30)} mies. temu`
  return `${Math.floor(days / 365)} lat temu`
})

/** Pokaż ostrzeżenie o zmianie hasła (gdy ≥ 90 dni lub nigdy nie zmieniane) */
const showPasswordRecommendationWarning = computed(() => {
  const s = securityInfo.value?.password_strength
  return s === 'consider_changing' || s === 'never_changed'
})

const privacyStatus = computed((): { label: string, icon: string, color: string, bgColor: string } => {
  const visibility = profileForView.value?.profile_visibility || 'public'
  const statuses: Record<string, { label: string, icon: string, color: string, bgColor: string }> = {
    public: {
      label: 'Publiczny',
      icon: 'i-heroicons-globe-alt',
      color: 'text-success-600 dark:text-success-400',
      bgColor: 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
    },
    private: {
      label: 'Prywatny',
      icon: 'i-heroicons-lock-closed',
      color: 'text-warning-600 dark:text-warning-400',
      bgColor: 'border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20'
    },
    friends: {
      label: 'Znajomi',
      icon: 'i-heroicons-user-group',
      color: 'text-info-600 dark:text-info-400',
      bgColor: 'border-info-200 bg-info-50 dark:border-info-800 dark:bg-info-900/20'
    }
  }
  return (statuses[visibility] ?? statuses.public) as { label: string, icon: string, color: string, bgColor: string }
})

/** Role użytkownika (placeholder – do użycia w sekcji Content) */
const _userRoles = computed(() => {
  if (!profileForView.value?.roles || !Array.isArray(profileForView.value.roles)) {
    return []
  }
  return profileForView.value.roles.map((role: { slug?: string, name?: string }) => role.slug || role.name)
})

const userActivity = computed(() => {
  const current = currentSession.value
  const sessionLifetime = 120 // minutes (z config/session.php)

  return {
    currentSession: {
      isActive: !!current,
      lastLoginAt: current?.last_activity ? formatRelativeTime(current.last_activity) : 'Nieznana',
      sessionExpiresAt: current?.last_activity ? formatExpirationTime(current.last_activity, sessionLifetime) : 'Nieznana'
    },
    recentLogins: recentLogins.value.map(login => ({
      id: login.id,
      ipAddress: login.ip_address || 'Unknown',
      location: login.location || 'Unknown',
      timestamp: formatRelativeTime(login.timestamp)
    })),
    recentActions: [] // Placeholder - będzie w przyszłości
  }
})

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Teraz'
  if (diffMins < 60) return `${diffMins} min temu`
  if (diffHours < 24) return `${diffHours} godz. temu`
  if (diffDays < 7) return `${diffDays} dni temu`
  return date.toLocaleDateString('pl-PL')
}

const formatExpirationTime = (lastActivity: string, lifetimeMinutes: number): string => {
  const date = new Date(lastActivity)
  const expirationDate = new Date(date.getTime() + lifetimeMinutes * 60000)
  const now = new Date()
  const diffMs = expirationDate.getTime() - now.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMs < 0) return 'Wygasła'
  if (diffMins < 60) return `Za ${diffMins} min`
  if (diffHours < 24) return `Za ${diffHours} godz.`
  if (diffDays < 7) return `Za ${diffDays} dni`
  return expirationDate.toLocaleDateString('pl-PL')
}

const handleLogoutOthers = async () => {
  if (!confirm('Czy na pewno chcesz wylogować wszystkie inne sesje? Będziesz musiał się zalogować ponownie na innych urządzeniach.')) {
    return
  }

  const success = await logoutOtherSessions()
  if (success) {
    await fetchSessions()
  }
}

/** Statystyki na Overview: wartości z API (stats) z fallbackiem na userContent; karty Articles/Media/Comments prowadzą do zakładki Content */
const overviewStats = computed(() => {
  const s = stats.value as ProfileContent['stats'] | null
  const u = userContent.value
  return [
    {
      label: 'Profile Complete',
      value: `${profileCompleteness.value}%`,
      icon: 'i-heroicons-user-circle',
      color: 'primary',
      bgGradient: 'from-primary-500 to-primary-600',
      navigateToContent: false
    },
    {
      label: 'Articles',
      value: s?.total_articles ?? u.totalArticles ?? 0,
      icon: 'i-heroicons-document-text',
      color: 'success',
      bgGradient: 'from-success-500 to-success-600',
      navigateToContent: true
    },
    {
      label: 'Media',
      value: s?.total_media ?? u.totalMedia ?? 0,
      icon: 'i-heroicons-photo',
      color: 'info',
      bgGradient: 'from-info-500 to-info-600',
      navigateToContent: true
    },
    {
      label: 'Comments',
      value: s?.total_comments ?? u.totalComments ?? 0,
      icon: 'i-heroicons-chat-bubble-left-right',
      color: 'warning',
      bgGradient: 'from-warning-500 to-warning-600',
      navigateToContent: true
    }
  ]
})

const userContent = computed(() => {
  const c = content.value as ProfileContent | null
  if (!c) {
    return {
      totalArticles: 0,
      totalMedia: 0,
      totalComments: 0,
      recentContent: [] as Array<{ id?: unknown, title?: string, type: string, createdAt?: string, status?: string }>
    }
  }

  const allContent = [
    ...(c.recent_articles || []).map((item: ProfileContentItem) => ({
      id: item.id,
      title: item.title,
      type: 'article',
      createdAt: item.createdAt,
      status: item.status
    })),
    ...(c.recent_media || []).map((item: ProfileContentItem & { originalName?: string }) => ({
      id: item.id,
      title: item.title ?? item.originalName,
      type: 'media',
      createdAt: item.createdAt,
      status: item.status
    })),
    ...(c.recent_comments || []).map((item: ProfileContentItem) => ({
      id: item.id,
      title: item.description,
      type: 'comment',
      createdAt: item.timestamp,
      status: 'published'
    }))
  ].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())

  return {
    totalArticles: c.stats?.total_articles || 0,
    totalMedia: c.stats?.total_media || 0,
    totalComments: c.stats?.total_comments || 0,
    recentContent: allContent.slice(0, 10)
  }
})

const getVisibilityDescription = (visibility: string | undefined): string => {
  if (!visibility) return 'Twój profil jest widoczny dla wszystkich użytkowników'
  const descriptions: Record<string, string> = {
    public: 'Twój profil jest widoczny dla wszystkich użytkowników',
    private: 'Twój profil jest widoczny tylko dla Ciebie',
    friends: 'Twój profil jest widoczny tylko dla Twoich znajomych'
  }
  return (descriptions[visibility] || descriptions.public) as string
}

const getContentTypeIcon = (type: string | undefined): string => {
  if (!type) return 'i-heroicons-document'
  const icons: Record<string, string> = {
    article: 'i-heroicons-document-text',
    media: 'i-heroicons-photo',
    comment: 'i-heroicons-chat-bubble-left-right'
  }
  return icons[type] ?? 'i-heroicons-document'
}

const getContentStatusColor = (status: string | undefined): string => {
  if (!status) return 'border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-300'
  const colors: Record<string, string> = {
    published: 'border-success-200 bg-success-50 text-success-700 dark:border-success-800 dark:bg-success-900/20 dark:text-success-300',
    draft: 'border-warning-200 bg-warning-50 text-warning-700 dark:border-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
    archived: 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/20 dark:text-neutral-300'
  }
  return (colors[status] || colors.draft) as string
}

// Handlers
const handleEditPicture = () => {
  isEditingPicture.value = true
}

const handleCancelEdit = (type: string) => {
  if (type === 'picture') {
    isEditingPicture.value = false
  } else if (type === 'profile') {
    isEditingProfile.value = false
  } else if (type === 'password') {
    isEditingPassword.value = false
  }
}

const handleEditProfile = () => {
  isEditingProfile.value = true
}

const handleEditPassword = () => {
  isEditingPassword.value = true
}

const handlePrivacySettings = () => {
  activeTab.value = 'privacy'
  toast.add({
    title: 'Ustawienia prywatności',
    description: 'Przejdź do zakładki Prywatność.',
    color: 'primary'
  })
}

/** Przejście do zakładki Zarządzanie kontem (główne miejsce akcji: eksport, deaktywacja, usunięcie) */
const goToAccountActions = () => {
  activeTab.value = 'account'
  toast.add({
    title: 'Zarządzanie kontem',
    description: 'Eksport danych, deaktywacja i usunięcie konta znajdują się tutaj.',
    color: 'primary'
  })
}

const handleFormSuccess = async () => {
  // Odśwież dane profilu po udanej aktualizacji
  await fetchProfile()
  if (activeTab.value === 'security' || activeTab.value === 'settings') {
    securityInfo.value = (await fetchSecurity()) as SecurityInfo | null
  }
}

const isEditingPicture = ref(false)
const isEditingProfile = ref(false)
const isEditingPassword = ref(false)

// Pobierz dane profilu przy mount
onMounted(async () => {
  await fetchProfile()
  if (activeTab.value === 'overview') {
    await fetchStats()
  }
  if (activeTab.value === 'content') {
    await fetchContent()
  }
  // Pobierz informacje o bezpieczeństwie (Settings i Security używają statusu hasła)
  if (activeTab.value === 'security' || activeTab.value === 'settings') {
    securityInfo.value = (await fetchSecurity()) as SecurityInfo | null
    if (activeTab.value === 'security') {
      await fetchTwoFactorStatus()
    }
  }
  // Pobierz sesje jeśli zakładka Activity jest aktywna
  if (activeTab.value === 'activity') {
    await fetchSessions()
    await fetchRecentLogins()
  }
})

// Pobierz dane przy zmianie zakładki
watch(activeTab, async (newTab) => {
  if (newTab === 'overview') {
    await fetchStats()
  }
  if (newTab === 'content') {
    await fetchContent()
  }
  if (newTab === 'security' || newTab === 'settings') {
    securityInfo.value = (await fetchSecurity()) as SecurityInfo | null
    if (newTab === 'security') {
      await fetchTwoFactorStatus()
    }
  }
  if (sessions.value) {
    if (newTab === 'activity' && sessions.value.length === 0) {
      await fetchSessions()
      await fetchRecentLogins()
      await fetchActivityLogs()
      await fetchActivityStats()
    }
  }
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Profil"
      icon="i-lucide-user"
    >
      <template #body>
        <!-- Profile Content -->
        <div class="space-y-8 p-4 sm:p-6 lg:p-8">
          <!-- Navigation Tabs -->
          <UCard
            variant="soft"
            padding="none"
            class="overflow-hidden"
          >
            <nav class="flex flex-wrap sm:flex-nowrap">
              <UButton
                v-for="tab in tabs"
                :key="tab.id"
                :variant="activeTab === tab.id ? 'solid' : 'ghost'"
                :color="activeTab === tab.id ? 'primary' : 'secondary'"
                :class="[
                  'flex flex-1 items-center gap-2 whitespace-nowrap rounded-none border-0 px-4 py-3 text-sm font-medium transition-all duration-300 sm:flex-none sm:px-6 sm:py-4',
                  activeTab === tab.id
                    ? `${getTabColor(tab.id)} scale-105 transform text-white shadow-lg`
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                ]"
                @click="activeTab = tab.id"
              >
                <UIcon
                  :name="tab.icon"
                  class="h-4 w-4 shrink-0"
                />
                <span class="hidden sm:inline">{{ tab.label }}</span>
              </UButton>
            </nav>
          </UCard>

          <!-- Tab Content -->
          <div
            v-show="activeTab === 'overview'"
            class="space-y-8"
          >
            <!-- Profile Header -->
            <UCard
              variant="subtle"
              class="bg-linear-to-br from-white to-primary-50 dark:from-neutral-900 dark:to-primary-950"
            >
              <div class="flex flex-col items-center space-y-6 lg:flex-row lg:items-start lg:space-x-8 lg:space-y-0">
                <!-- Avatar -->
                <div class="relative shrink-0">
                  <div class="relative h-28 w-28 sm:h-32 sm:w-32">
                    <UAvatar
                      v-if="profileForView && profileForView.avatar_url"
                      :src="profileAvatarSrc"
                      :alt="(profileForView.first_name || '') + ' ' + (profileForView.last_name || '')"
                      :first-name="profileForView.first_name || ''"
                      :last-name="profileForView.last_name || ''"
                      class="h-28 w-28 sm:h-32 sm:w-32"
                    />
                    <div
                      v-else
                      class="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-linear-to-br from-primary-400 to-primary-600 shadow-lg dark:border-neutral-700"
                    >
                      <UIcon
                        name="i-heroicons-user"
                        class="text-4xl text-white sm:text-5xl"
                      />
                    </div>
                    <!-- Online status indicator -->
                    <div
                      v-if="userActivity?.currentSession?.isActive"
                      class="absolute -bottom-1 -right-1 flex h-8 w-8 animate-pulse items-center justify-center rounded-full border-4 border-white bg-linear-to-r from-success-400 to-success-500 shadow-lg dark:border-neutral-900"
                    >
                      <UIcon
                        name="i-heroicons-signal"
                        class="h-4 w-4 text-white"
                      />
                    </div>
                  </div>
                </div>

                <!-- Basic Info -->
                <div class="flex-1 text-center lg:text-left">
                  <div class="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
                    <div class="space-y-2">
                      <h2 class="bg-linear-to-r from-neutral-900 to-neutral-700 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-white dark:to-neutral-200">
                        {{ profileForView?.full_name || profileForView?.username || profileForView?.name }}
                      </h2>
                      <div class="flex items-center justify-center gap-2 lg:justify-start">
                        <UIcon
                          name="i-heroicons-envelope"
                          class="h-5 w-5 text-primary-500"
                        />
                        <p class="text-lg text-neutral-600 dark:text-neutral-300">
                          {{ profileForView?.email }}
                        </p>
                      </div>
                    </div>

                    <!-- Profile Action Buttons -->
                    <div class="flex flex-wrap justify-center gap-3 lg:justify-end">
                      <UButton
                        color="primary"
                        variant="subtle"
                        icon="i-heroicons-photo"
                        size="sm"
                        class="shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        @click="activeTab = 'settings'"
                      >
                        <span class="hidden sm:inline">Edit Photo</span>
                      </UButton>
                      <UButton
                        color="secondary"
                        variant="subtle"
                        icon="i-heroicons-pencil"
                        size="sm"
                        class="shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        @click="activeTab = 'settings'"
                      >
                        <span class="hidden sm:inline">Edit Profile</span>
                      </UButton>
                    </div>
                  </div>

                  <!-- Status Badges -->
                  <div class="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                    <div
                      class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-sm transition-all duration-200 hover:shadow-md"
                      :class="accountStatus.class"
                    >
                      <UIcon
                        :name="accountStatus.icon"
                        class="h-4 w-4"
                      />
                      <span class="font-semibold">{{ accountStatus.label }}</span>
                    </div>
                    <div
                      class="flex items-center gap-2 rounded-full border px-4 py-2 text-sm shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer"
                      :class="privacyStatus?.bgColor"
                      @click="activeTab = 'privacy'"
                    >
                      <UIcon
                        :name="privacyStatus?.icon"
                        class="h-4 w-4"
                        :class="privacyStatus?.color"
                      />
                      <span
                        class="font-semibold"
                        :class="privacyStatus?.color"
                      >{{ privacyStatus?.label }}</span>
                    </div>
                    <div
                      class="flex items-center gap-2 rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-sm text-primary-700 shadow-sm dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300"
                    >
                      <UIcon
                        name="i-heroicons-user-circle"
                        class="h-4 w-4"
                      />
                      <span class="font-semibold">My Account</span>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              <UCard
                v-for="(stat, index) in overviewStats"
                :key="index"
                variant="subtle"
                :class="[
                  'transition-all duration-300 hover:-translate-y-1',
                  stat.navigateToContent ? 'cursor-pointer' : ''
                ]"
                @click="stat.navigateToContent ? (activeTab = 'content') : undefined"
              >
                <div class="flex items-center justify-between">
                  <div class="space-y-2">
                    <div
                      class="bg-linear-to-r text-3xl font-bold lg:text-4xl"
                      :class="`from-${stat.color}-600 to-${stat.color}-500 bg-clip-text text-transparent`"
                    >
                      {{ stat.value }}
                    </div>
                    <div class="text-sm font-semibold uppercase tracking-wide text-neutral-600 dark:text-neutral-300">
                      {{ stat.label }}
                    </div>
                  </div>
                  <div :class="`rounded-2xl bg-linear-to-br p-4 ${stat.bgGradient} shadow-lg`">
                    <UIcon
                      :name="stat.icon"
                      class="h-8 w-8 text-white"
                    />
                  </div>
                </div>
              </UCard>
            </div>

            <!-- Detailed Info Grid -->
            <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <!-- Bio Section -->
              <UCard
                variant="subtle"
                class="transition-all duration-300"
              >
                <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                  <div class="rounded-lg bg-linear-to-r from-info-500 to-info-600 p-2">
                    <UIcon
                      name="i-heroicons-document-text"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                  <span class="bg-linear-to-r from-info-600 to-info-500 bg-clip-text text-transparent">Bio</span>
                </h3>
                <div class="leading-relaxed text-neutral-600 dark:text-neutral-300">
                  <p
                    v-if="profileForView?.bio"
                    class="whitespace-pre-wrap text-base"
                  >
                    {{ profileForView.bio }}
                  </p>
                  <div
                    v-else
                    class="bg-neutral-50 flex items-center gap-3 rounded-xl p-4 italic text-neutral-400 dark:bg-neutral-800"
                  >
                    <UIcon
                      name="i-heroicons-information-circle"
                      class="h-5 w-5 shrink-0"
                    />
                    <span>No bio provided</span>
                  </div>
                </div>
              </UCard>

              <!-- Account Details -->
              <UCard
                variant="subtle"
                class="transition-all duration-300"
              >
                <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                  <div class="rounded-lg bg-linear-to-r from-primary-500 to-primary-600 p-2">
                    <UIcon
                      name="i-heroicons-user-circle"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                  <span class="bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Account Details</span>
                </h3>
                <div class="space-y-4">
                  <div
                    v-for="(detail, index) in [
                      {
                        icon: 'i-heroicons-calendar-days',
                        label: 'Member since',
                        value: new Date(profileForView?.created_at || Date.now()).toLocaleDateString(),
                        color: 'text-success-500'
                      },
                      {
                        icon: 'i-heroicons-clock',
                        label: 'Last updated',
                        value: new Date(profileForView?.updated_at || Date.now()).toLocaleDateString(),
                        color: 'text-info-500'
                      },
                      {
                        icon: 'i-heroicons-identification',
                        label: 'Username',
                        value: profileForView?.username || 'Not set',
                        color: 'text-primary-500'
                      }
                    ]"
                    :key="index"
                    class="bg-neutral-50 flex items-center justify-between rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700"
                  >
                    <div class="flex items-center gap-3">
                      <UIcon
                        :name="detail.icon"
                        :class="`h-5 w-5 ${detail.color}`"
                      />
                      <span class="font-medium text-neutral-600 dark:text-neutral-300">{{ detail.label }}</span>
                    </div>
                    <span class="font-semibold text-neutral-900 dark:text-neutral-100">{{ detail.value }}</span>
                  </div>

                  <div class="bg-neutral-50 flex items-center justify-between rounded-xl px-4 py-3 dark:bg-neutral-800">
                    <div class="flex items-center gap-3">
                      <UIcon
                        name="i-heroicons-shield-check"
                        class="h-5 w-5 text-warning-500"
                      />
                      <span class="font-medium text-neutral-600 dark:text-neutral-300">Verification status</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <UIcon
                        :name="profileForView?.email_verified_at ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                        :class="profileForView?.email_verified_at ? 'text-success-500' : 'text-error-500'"
                        class="h-5 w-5"
                      />
                      <span
                        class="font-semibold"
                        :class="profileForView?.email_verified_at ? 'text-success-600' : 'text-error-600'"
                      >
                        {{ profileForView?.email_verified_at ? 'Verified' : 'Unverified' }}
                      </span>
                    </div>
                  </div>
                </div>
              </UCard>

              <!-- Roles -->
              <UCard
                variant="subtle"
                class="transition-all duration-300"
              >
                <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                  <div class="rounded-lg bg-linear-to-r from-warning-500 to-warning-600 p-2">
                    <UIcon
                      name="i-heroicons-key"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                  <span class="bg-linear-to-r from-warning-600 to-warning-500 bg-clip-text text-transparent">Roles</span>
                </h3>
                <div class="flex flex-wrap gap-3">
                  <div
                    v-for="role in (profileForView?.roles || []).map((r: { slug?: string, name?: string }) => r.slug || r.name)"
                    :key="role"
                    class="group flex items-center gap-2 rounded-xl border-2 px-4 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    :style="{
                      backgroundColor: getRoleColor(role) === 'primary' ? '#3b82f6' : getRoleColor(role) === 'success' ? '#10b981' : getRoleColor(role) === 'warning' ? '#f59e0b' : getRoleColor(role) === 'error' ? '#ef4444' : '#6366f1',
                      borderColor: getRoleColor(role) === 'primary' ? '#2563eb' : getRoleColor(role) === 'success' ? '#059669' : getRoleColor(role) === 'warning' ? '#d97706' : getRoleColor(role) === 'error' ? '#dc2626' : '#4f46e5',
                      color: 'white'
                    }"
                  >
                    <UIcon
                      :name="getRoleIcon(role)"
                      class="h-5 w-5 text-white"
                    />
                    <span class="text-sm font-bold text-white">{{ getRoleName(role) }}</span>
                  </div>
                  <div
                    v-if="!profileForView?.roles"
                    class="bg-neutral-100 border-2 border-neutral-300 rounded-xl px-4 py-3 italic text-neutral-600 dark:bg-neutral-800 dark:border-neutral-600 dark:text-neutral-400"
                  >
                    <UIcon
                      name="i-heroicons-information-circle"
                      class="inline h-5 w-5 mr-2"
                    />
                    No roles assigned
                  </div>
                </div>
              </UCard>

              <!-- Quick Settings -->
              <UCard
                variant="subtle"
                class="transition-all duration-300"
              >
                <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                  <div class="rounded-lg bg-linear-to-r from-error-500 to-error-600 p-2">
                    <UIcon
                      name="i-heroicons-cog-6-tooth"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                  <span class="bg-linear-to-r from-error-600 to-error-500 bg-clip-text text-transparent">Quick Settings</span>
                </h3>
                <div class="grid grid-cols-1 gap-4">
                  <UButton
                    color="primary"
                    variant="subtle"
                    icon="i-heroicons-arrow-down-tray"
                    class="justify-center shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    @click="goToAccountActions"
                  >
                    Export My Data
                  </UButton>
                  <UButton
                    color="secondary"
                    variant="subtle"
                    icon="i-heroicons-shield-check"
                    class="justify-center shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    @click="handlePrivacySettings"
                  >
                    Privacy Settings
                  </UButton>
                  <UButton
                    color="error"
                    variant="subtle"
                    icon="i-heroicons-user-circle"
                    class="justify-center shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    @click="goToAccountActions"
                  >
                    Zarządzanie kontem
                  </UButton>
                </div>
              </UCard>
            </div>
          </div>

          <!-- Settings Tab -->
          <div
            v-show="activeTab === 'settings'"
            class="space-y-8"
          >
            <!-- Profile Edit Forms -->
            <div class="grid grid-cols-1 gap-8">
              <!-- Profile Picture Section -->
              <UCard
                variant="subtle"
                class="transition-all duration-300 bg-linear-to-br from-white to-primary-50 dark:from-neutral-900 dark:to-primary-950"
              >
                <div class="mb-6 flex items-center justify-between">
                  <h3 class="flex items-center gap-3 text-xl font-bold">
                    <div class="rounded-lg bg-linear-to-r from-primary-500 to-primary-600 p-2">
                      <UIcon
                        name="i-heroicons-photo"
                        class="h-6 w-6 text-white"
                      />
                    </div>
                    <span class="bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">Profile Picture</span>
                  </h3>
                  <UButton
                    :color="isEditingPicture ? 'error' : 'primary'"
                    variant="ghost"
                    :icon="isEditingPicture ? 'i-heroicons-x-mark' : 'i-heroicons-pencil'"
                    size="sm"
                    @click="isEditingPicture ? handleCancelEdit('picture') : handleEditPicture()"
                  >
                    {{ isEditingPicture ? 'Cancel' : 'Edit' }}
                  </UButton>
                </div>

                <!-- View Mode -->
                <div
                  v-if="!isEditingPicture"
                  class="text-center"
                >
                  <div class="mb-4 flex justify-center">
                    <div class="relative h-32 w-32">
                      <UAvatar
                        v-if="profileForView && profileForView.avatar_url"
                        :src="profileAvatarSrc"
                        :alt="(profileForView.first_name || '') + ' ' + (profileForView.last_name || '')"
                        :first-name="profileForView.first_name || ''"
                        :last-name="profileForView.last_name || ''"
                        class="h-32 w-32"
                      />
                      <div
                        v-else
                        class="flex h-full w-full items-center justify-center rounded-full border-4 border-primary-200 bg-linear-to-br from-primary-400 to-primary-600 shadow-lg"
                      >
                        <UIcon
                          name="i-heroicons-user"
                          class="text-4xl text-white"
                        />
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">
                    Current profile picture. Click "Edit" to change it.
                  </p>
                </div>

                <!-- Edit Mode -->
                <div v-else>
                  <DashboardProfileUpdateAvatar
                    @success="handleFormSuccess(); isEditingPicture = false"
                    @cancel="handleCancelEdit('picture')"
                  />
                </div>
              </UCard>

              <!-- Profile Information Section -->
              <UCard
                variant="subtle"
                class="transition-all duration-300"
              >
                <div class="mb-6 flex items-center justify-between">
                  <h3 class="flex items-center gap-3 text-xl font-bold">
                    <div class="rounded-lg bg-linear-to-r from-success-500 to-success-600 p-2">
                      <UIcon
                        name="i-heroicons-user"
                        class="h-6 w-6 text-white"
                      />
                    </div>
                    <span class="bg-linear-to-r from-success-600 to-success-500 bg-clip-text text-transparent">Personal Information</span>
                  </h3>
                  <UButton
                    :color="isEditingProfile ? 'error' : 'success'"
                    variant="ghost"
                    :icon="isEditingProfile ? 'i-heroicons-x-mark' : 'i-heroicons-pencil'"
                    size="sm"
                    @click="isEditingProfile ? handleCancelEdit('profile') : handleEditProfile()"
                  >
                    {{ isEditingProfile ? 'Cancel' : 'Edit' }}
                  </UButton>
                </div>

                <!-- View Mode -->
                <div
                  v-if="!isEditingProfile"
                  class="space-y-4"
                >
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div class="bg-neutral-50 dark:bg-elevated rounded-xl p-4">
                      <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Imię / Nazwa wyświetlana
                      </div>
                      <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {{ profileForView?.name || 'Not set' }}
                      </div>
                    </div>

                    <div class="bg-neutral-50 dark:bg-elevated rounded-xl p-4">
                      <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Nazwa użytkownika
                      </div>
                      <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {{ profileForView?.username || 'Not set' }}
                      </div>
                    </div>

                    <div class="bg-neutral-50 dark:bg-elevated rounded-xl p-4">
                      <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Adres email
                      </div>
                      <div class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {{ profileForView?.email || 'Not set' }}
                      </div>
                    </div>
                  </div>
                  <div class="bg-neutral-50 dark:bg-elevated rounded-xl p-4">
                    <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                      Bio
                    </div>
                    <div class="text-neutral-900 dark:text-neutral-100 whitespace-pre-wrap">
                      {{ profileForView?.bio || 'No bio provided' }}
                    </div>
                  </div>
                </div>

                <!-- Edit Mode -->
                <div v-else>
                  <DashboardProfileUpdateInformation
                    @success="handleFormSuccess(); isEditingProfile = false"
                    @cancel="handleCancelEdit('profile')"
                  />
                </div>
              </UCard>
            </div>

            <!-- Password Section -->
            <UCard
              variant="subtle"
              class="transition-all duration-300"
            >
              <div class="mb-6 flex items-center justify-between">
                <h3 class="flex items-center gap-3 text-xl font-bold">
                  <div class="rounded-lg bg-linear-to-r from-warning-500 to-warning-600 p-2">
                    <UIcon
                      name="i-heroicons-lock-closed"
                      class="h-6 w-6 text-white"
                    />
                  </div>
                  <span class="bg-linear-to-r from-warning-600 to-warning-500 bg-clip-text text-transparent">Password & Security</span>
                </h3>
                <UButton
                  :color="isEditingPassword ? 'error' : 'warning'"
                  variant="ghost"
                  :icon="isEditingPassword ? 'i-heroicons-x-mark' : 'i-heroicons-pencil'"
                  size="sm"
                  @click="isEditingPassword ? handleCancelEdit('password') : handleEditPassword()"
                >
                  {{ isEditingPassword ? 'Cancel' : 'Change Password' }}
                </UButton>
              </div>

              <!-- View Mode -->
              <div
                v-if="!isEditingPassword"
                class="space-y-4"
              >
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div class="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon
                        :name="securityInfo?.password_strength === 'strong' ? 'i-heroicons-shield-check' : 'i-heroicons-key'"
                        :class="securityInfo?.password_strength === 'strong' ? 'h-5 w-5 text-success-500' : (securityInfo?.password_strength === 'consider_changing' ? 'h-5 w-5 text-warning-500' : 'h-5 w-5 text-info-500')"
                      />
                      <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Status hasła
                      </div>
                    </div>
                    <div :class="['font-semibold', passwordStatusClass]">
                      {{ passwordStatusLabel }}
                    </div>
                  </div>
                  <div class="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <UIcon
                        name="i-heroicons-clock"
                        class="h-5 w-5 text-info-500"
                      />
                      <div class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        Ostatnia zmiana
                      </div>
                    </div>
                    <div class="text-info-600 dark:text-info-400 font-semibold">
                      {{ lastPasswordChangeLabel }}
                    </div>
                  </div>
                </div>
                <div
                  v-if="showPasswordRecommendationWarning"
                  class="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-xl p-4"
                >
                  <div class="flex items-center gap-2">
                    <UIcon
                      name="i-heroicons-exclamation-triangle"
                      class="h-5 w-5 text-warning-600 shrink-0"
                    />
                    <div class="text-sm text-warning-700 dark:text-warning-300">
                      Ze względów bezpieczeństwa zalecamy zmianę hasła co 90 dni.
                      <span v-if="securityInfo?.password_strength === 'never_changed'"> Twoje hasło nie było jeszcze zmieniane od rejestracji.</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Edit Mode -->
              <div v-else>
                <DashboardProfileUpdatePassword
                  @success="handleFormSuccess(); isEditingPassword = false"
                  @cancel="handleCancelEdit('password')"
                />
              </div>
            </UCard>

            <!-- Account Preferences -->
            <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
              <!-- Privacy Settings -->
              <UCard
                variant="subtle"
                class="transition-all duration-300"
              >
                <div class="mb-6 flex items-center justify-between">
                  <h3 class="flex items-center gap-3 text-xl font-bold">
                    <div class="rounded-lg bg-linear-to-r from-info-500 to-info-600 p-2">
                      <UIcon
                        name="i-heroicons-shield-check"
                        class="h-6 w-6 text-white"
                      />
                    </div>
                    <span class="bg-linear-to-r from-info-600 to-info-500 bg-clip-text text-transparent">Privacy Settings</span>
                  </h3>
                  <UButton
                    color="info"
                    variant="ghost"
                    icon="i-heroicons-pencil"
                    size="sm"
                    @click="activeTab = 'privacy'"
                  >
                    Edit
                  </UButton>
                </div>

                <div class="space-y-6">
                  <!-- Current Profile Visibility -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Profile Visibility
                    </label>
                    <div class="rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 bg-neutral-50 dark:bg-neutral-800">
                      <div class="flex items-center gap-3">
                        <UIcon
                          :name="privacyStatus?.icon"
                          :class="privacyStatus?.color"
                          class="h-5 w-5"
                        />
                        <div>
                          <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ privacyStatus?.label }}</span>
                          <p class="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                            {{ getVisibilityDescription(profileForView?.profile_visibility) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Current Email Notifications -->
                  <div class="space-y-3">
                    <label class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Email Notifications
                    </label>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                        <div class="flex items-center gap-3">
                          <UIcon
                            name="i-heroicons-chat-bubble-left-right"
                            class="h-4 w-4 text-primary-600"
                          />
                          <span class="text-sm text-neutral-900 dark:text-neutral-100">New messages (Funkcja nieaktywna)</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <UIcon
                            :name="profileForView?.emailNotificationsNewMessages ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                            :class="profileForView?.emailNotificationsNewMessages ? 'text-success-500' : 'text-neutral-400'"
                            class="h-5 w-5"
                          />
                          <span
                            class="text-sm font-medium"
                            :class="profileForView?.emailNotificationsNewMessages ? 'text-success-600' : 'text-neutral-500'"
                          >
                            {{ profileForView?.emailNotificationsNewMessages ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                        <div class="flex items-center gap-3">
                          <UIcon
                            name="i-heroicons-user-plus"
                            class="h-4 w-4 text-primary-600"
                          />
                          <span class="text-sm text-neutral-900 dark:text-neutral-100">Friend requests (Funkcja nieaktywna)</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <UIcon
                            :name="profileForView?.emailNotificationsFriendRequests ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                            :class="profileForView?.emailNotificationsFriendRequests ? 'text-success-500' : 'text-neutral-400'"
                            class="h-5 w-5"
                          />
                          <span
                            class="text-sm font-medium"
                            :class="profileForView?.emailNotificationsFriendRequests ? 'text-success-600' : 'text-neutral-500'"
                          >
                            {{ profileForView?.emailNotificationsFriendRequests ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
                        <div class="flex items-center gap-3">
                          <UIcon
                            name="i-heroicons-bell"
                            class="h-4 w-4 text-primary-600"
                          />
                          <span class="text-sm text-neutral-900 dark:text-neutral-100">System updates (Funkcja nieaktywna)</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <UIcon
                            :name="profileForView?.emailNotificationsSystemUpdates ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                            :class="profileForView?.emailNotificationsSystemUpdates ? 'text-success-500' : 'text-neutral-400'"
                            class="h-5 w-5"
                          />
                          <span
                            class="text-sm font-medium"
                            :class="profileForView?.emailNotificationsSystemUpdates ? 'text-success-600' : 'text-neutral-500'"
                          >
                            {{ profileForView?.emailNotificationsSystemUpdates ? 'Enabled' : 'Disabled' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
                  <UButton
                    color="info"
                    variant="outline"
                    icon="i-heroicons-cog-6-tooth"
                    class="w-full"
                    @click="activeTab = 'privacy'"
                  >
                    Manage Privacy Settings
                  </UButton>
                </div>
              </UCard>

              <!-- Zarezerwowane na przyszłe ustawienia (powiadomienia, motyw, język itd.) -->
              <UCard
                variant="subtle"
                class="transition-all duration-300 border-dashed"
              >
                <h3 class="mb-3 flex items-center gap-3 text-lg font-semibold text-neutral-600 dark:text-neutral-400">
                  <UIcon
                    name="i-heroicons-cog-8-tooth"
                    class="h-5 w-5 text-neutral-400 dark:text-neutral-500"
                  />
                  Inne ustawienia
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-500">
                  To miejsce jest zarezerwowane na kolejne opcje konfiguracji (np. preferencje powiadomień, motyw, język). Pojawią się tu w przyszłych aktualizacjach.
                </p>
              </UCard>
            </div>

            <!-- Two-Factor Authentication -->
            <UCard
              variant="subtle"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-success-500 to-success-600 p-2">
                  <UIcon
                    name="i-heroicons-device-phone-mobile"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-success-600 to-success-500 bg-clip-text text-transparent">Two-Factor Authentication (Funkcja nieaktywna)</span>
              </h3>

              <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <!-- Current Status -->
                <div class="space-y-4">
                  <div
                    v-if="twoFactorStatus?.enabled"
                    class="flex items-center gap-3 rounded-xl border border-success-200 bg-success-50 p-4 dark:border-success-800 dark:bg-success-900/20"
                  >
                    <UIcon
                      name="i-heroicons-check-circle"
                      class="h-6 w-6 text-success-600"
                    />
                    <div>
                      <h4 class="font-semibold text-success-900 dark:text-success-100">
                        2FA Enabled
                      </h4>
                      <p class="text-sm text-success-700 dark:text-success-300">
                        Your account is protected by two-factor authentication
                      </p>
                    </div>
                  </div>
                  <div
                    v-else
                    class="flex items-center gap-3 rounded-xl border border-warning-200 bg-warning-50 p-4 dark:border-warning-800 dark:bg-warning-900/20"
                  >
                    <UIcon
                      name="i-heroicons-exclamation-triangle"
                      class="h-6 w-6 text-warning-600"
                    />
                    <div>
                      <h4 class="font-semibold text-warning-900 dark:text-warning-100">
                        2FA Not Enabled
                      </h4>
                      <p class="text-sm text-warning-700 dark:text-warning-300">
                        Your account is not protected by two-factor authentication
                      </p>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">
                      Recommended Security Steps:
                    </h4>
                    <ul class="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <li
                        v-for="(step, stepIndex) in securityChecklist"
                        :key="stepIndex"
                        class="flex items-center gap-2"
                        :class="step.done ? 'text-success-500' : 'text-neutral-500'"
                      >
                        <UIcon
                          :name="step.done ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                          :class="step.done ? 'h-4 w-4 text-success-500' : 'h-4 w-4 text-error-500'"
                        />
                        {{ step.label }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Setup 2FA -->
                <div class="space-y-4">
                  <h4 class="font-semibold text-neutral-900 dark:text-neutral-100">
                    Enable Two-Factor Authentication
                  </h4>
                  <p class="text-sm text-neutral-600 dark:text-neutral-400">
                    Add an extra layer of security to your account by requiring a verification code from your phone.
                  </p>

                  <div class="space-y-3">
                    <UButton
                      color="success"
                      variant="solid"
                      icon="i-heroicons-device-phone-mobile"
                      class="w-full"
                    >
                      Setup 2FA with SMS
                    </UButton>
                    <UButton
                      color="primary"
                      variant="outline"
                      icon="i-heroicons-qr-code"
                      class="w-full"
                    >
                      Setup 2FA with Authenticator App
                    </UButton>
                  </div>

                  <div class="mt-4 p-3 rounded-lg bg-info-50 dark:bg-info-900/20">
                    <p class="text-xs text-info-700 dark:text-info-300">
                      💡 We recommend using an authenticator app like Google Authenticator or Authy for better security.
                    </p>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Activity Tab -->
          <div
            v-show="activeTab === 'activity'"
            class="space-y-8"
          >
            <!-- Activity Status -->
            <UCard
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-success-500 to-success-600 p-2">
                  <UIcon
                    name="i-heroicons-chart-bar"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-success-600 to-success-500 bg-clip-text text-transparent">Activity Status</span>
              </h3>

              <!-- Current Session -->
              <div class="mb-8">
                <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <UIcon
                    name="i-heroicons-device-phone-mobile"
                    class="h-5 w-5 text-primary-500"
                  />
                  Current Session
                </h4>
                <div class="space-y-4 rounded-xl border border-primary-200 bg-linear-to-r from-primary-50 to-neutral-50 p-6 dark:border-primary-800 dark:from-primary-900/20 dark:to-neutral-900/20">
                  <div
                    v-for="(item, index) in [
                      {
                        label: 'Status',
                        value: userActivity.currentSession.isActive ? 'Active' : 'Inactive',
                        icon: userActivity.currentSession.isActive ? 'i-heroicons-signal' : 'i-heroicons-signal-slash',
                        color: userActivity.currentSession.isActive ? 'text-success-600' : 'text-error-600'
                      },
                      {
                        label: 'Last Login',
                        value: userActivity.currentSession.lastLoginAt,
                        icon: 'i-heroicons-clock',
                        color: 'text-primary-600'
                      },
                      {
                        label: 'Session Expires',
                        value: userActivity.currentSession.sessionExpiresAt,
                        icon: 'i-heroicons-calendar',
                        color: 'text-info-600'
                      }
                    ]"
                    :key="index"
                    class="flex items-center justify-between py-2"
                  >
                    <div class="flex items-center gap-3">
                      <UIcon
                        :name="item.icon"
                        :class="`h-5 w-5 ${item.color}`"
                      />
                      <span class="font-medium text-neutral-700 dark:text-neutral-300">{{ item.label }}</span>
                    </div>
                    <span :class="`font-semibold ${item.color}`">{{ item.value }}</span>
                  </div>
                </div>
              </div>

              <!-- Recent Activity Grid -->
              <div class="grid grid-cols-1 gap-8 xl:grid-cols-2">
                <!-- Recent Logins -->
                <div>
                  <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <UIcon
                      name="i-heroicons-globe-alt"
                      class="h-5 w-5 text-success-500"
                    />
                    Ostatnie logowania
                  </h4>
                  <div
                    v-if="isLoadingSessions"
                    class="flex justify-center py-8"
                  >
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="h-8 w-8 animate-spin text-primary-500"
                    />
                  </div>
                  <div
                    v-else-if="userActivity.recentLogins?.length"
                    class="space-y-3"
                  >
                    <div
                      v-for="login in userActivity.recentLogins"
                      :key="login.id"
                      class="flex items-center justify-between rounded-xl border border-success-200 bg-success-50 px-6 py-4 transition-all duration-200 hover:shadow-md dark:border-success-800 dark:bg-success-900/20"
                    >
                      <div class="flex items-center gap-3">
                        <UIcon
                          name="i-heroicons-computer-desktop"
                          class="h-5 w-5 text-success-600"
                        />
                        <div>
                          <span class="font-mono text-sm font-semibold">{{ login.ipAddress }}</span>
                          <p class="text-xs text-success-600">
                            {{ login.location }}
                          </p>
                        </div>
                      </div>
                      <span class="text-sm font-medium text-success-600">{{ login.timestamp }}</span>
                    </div>
                  </div>
                  <div
                    v-else
                    class="text-center py-8 text-neutral-500 dark:text-neutral-400"
                  >
                    <p>Brak ostatnich logowań</p>
                  </div>
                </div>

                <!-- Other Active Sessions -->
                <div>
                  <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <UIcon
                      name="i-heroicons-computer-desktop"
                      class="h-5 w-5 text-info-500"
                    />
                    Inne aktywne sesje
                  </h4>
                  <div
                    v-if="isLoadingSessions"
                    class="flex justify-center py-8"
                  >
                    <UIcon
                      name="i-heroicons-arrow-path"
                      class="h-8 w-8 animate-spin text-primary-500"
                    />
                  </div>
                  <div
                    v-else-if="otherSessions.length > 0"
                    class="space-y-3"
                  >
                    <div
                      v-for="session in otherSessions"
                      :key="session.id"
                      class="flex items-center justify-between rounded-xl border border-info-200 bg-info-50 px-6 py-4 transition-all duration-200 hover:shadow-md dark:border-info-800 dark:bg-info-900/20"
                    >
                      <div class="flex items-center gap-3">
                        <UIcon
                          name="i-heroicons-device-phone-mobile"
                          class="h-5 w-5 text-info-600"
                        />
                        <div>
                          <span class="font-mono text-sm font-semibold">{{ session.ip_address || 'Unknown' }}</span>
                          <p class="text-xs text-info-600">
                            {{ session.location || 'Unknown' }} • {{ session.device_type || 'Unknown' }}
                          </p>
                        </div>
                      </div>
                      <span class="text-sm font-medium text-info-600">{{ formatRelativeTime(session.last_activity ?? '') }}</span>
                    </div>
                    <UButton
                      variant="outline"
                      color="error"
                      size="sm"
                      class="mt-2"
                      @click="handleLogoutOthers"
                    >
                      Wyloguj wszystkie inne sesje
                    </UButton>
                  </div>
                  <div
                    v-else
                    class="text-center py-8 text-neutral-500 dark:text-neutral-400"
                  >
                    <p>Brak innych aktywnych sesji</p>
                  </div>
                </div>

                <!-- Recent Actions -->
                <div
                  v-if="activityLogs.length > 0"
                  class="xl:col-span-2"
                >
                  <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <UIcon
                      name="i-heroicons-clipboard-document-list"
                      class="h-5 w-5 text-info-500"
                    />
                    Ostatnie akcje
                  </h4>
                  <div class="space-y-3">
                    <div
                      v-for="action in activityLogs.slice(0, 10)"
                      :key="action.id"
                      class="flex items-center justify-between rounded-xl border px-6 py-4 transition-all duration-200 hover:shadow-md"
                      :class="`border-${getActionColor(action.action)}-200 bg-${getActionColor(action.action)}-50 dark:border-${getActionColor(action.action)}-800 dark:bg-${getActionColor(action.action)}-900/20`"
                    >
                      <div class="flex items-center gap-3">
                        <UIcon
                          :name="getActionIcon(action.action)"
                          :class="`h-5 w-5 text-${getActionColor(action.action)}-600`"
                        />
                        <div>
                          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">{{ getActionLabel(action.action) }}</span>
                          <p
                            v-if="action.description"
                            class="text-xs text-neutral-600 dark:text-neutral-400"
                          >
                            {{ action.description }}
                          </p>
                        </div>
                      </div>
                      <span :class="`text-sm font-medium text-${getActionColor(action.action)}-600`">{{ action.created_at }}</span>
                    </div>
                  </div>
                </div>
                <div
                  v-else-if="!isLoadingActivity"
                  class="xl:col-span-2 text-center py-8 text-neutral-500 dark:text-neutral-400"
                >
                  <UIcon
                    name="i-heroicons-clipboard-document-list"
                    class="mx-auto mb-2 h-8 w-8"
                  />
                  <p>Brak zarejestrowanych akcji</p>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Content Tab -->
          <div
            v-show="activeTab === 'content'"
            class="space-y-8"
          >
            <!-- Content Overview -->
            <UCard
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-purple-500 to-purple-600 p-2">
                  <UIcon
                    name="i-heroicons-document-text"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">Content Overview</span>
              </h3>

              <!-- Content Stats -->
              <div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                <div
                  v-for="stat in [
                    { label: 'Articles', value: userContent?.totalArticles || 0, icon: 'i-heroicons-document-text', color: 'blue' },
                    { label: 'Media', value: userContent?.totalMedia || 0, icon: 'i-heroicons-photo', color: 'green' },
                    { label: 'Comments', value: userContent?.totalComments || 0, icon: 'i-heroicons-chat-bubble-left-right', color: 'yellow' },
                    { label: 'Views', value: '12.5K', icon: 'i-heroicons-eye', color: 'purple' }
                  ]"
                  :key="stat.label"
                  class="from-neutral-50 rounded-xl bg-linear-to-br to-neutral-100 p-4 text-center dark:from-neutral-800 dark:to-neutral-700"
                >
                  <UIcon
                    :name="stat.icon"
                    :class="`mx-auto mb-2 h-8 w-8 text-${stat.color}-500`"
                  />
                  <div :class="`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`">
                    {{ stat.value }}
                  </div>
                  <div class="text-sm text-neutral-600 dark:text-neutral-300">
                    {{ stat.label }}
                  </div>
                </div>
              </div>

              <!-- Recent Content -->
              <div v-if="userContent?.recentContent?.length">
                <h4 class="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <UIcon
                    name="i-heroicons-clock"
                    class="h-5 w-5 text-purple-500"
                  />
                  Recent Content
                </h4>
                <div class="space-y-3">
                  <div
                    v-for="(contentItem, contentIndex) in userContent.recentContent"
                    :key="contentItem.id != null ? String(contentItem.id) : contentIndex"
                    class="flex items-center justify-between rounded-xl border border-purple-200 bg-purple-50 p-4 transition-all duration-200 hover:shadow-md dark:border-purple-800 dark:bg-purple-900/20"
                  >
                    <div class="flex items-center gap-3">
                      <UIcon
                        :name="getContentTypeIcon(contentItem.type)"
                        class="h-5 w-5 text-purple-600"
                      />
                      <div>
                        <span class="font-medium text-neutral-900 dark:text-neutral-100">{{ contentItem.title }}</span>
                        <p class="text-xs text-neutral-600 dark:text-neutral-400">
                          {{ contentItem.type }} • {{ contentItem.createdAt }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span
                        :class="`rounded-full border px-3 py-1 text-xs font-medium ${getContentStatusColor(contentItem.status)}`"
                      >
                        {{ contentItem.status }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No Content Message -->
              <div
                v-else
                class="py-12 text-center"
              >
                <UIcon
                  name="i-heroicons-document"
                  class="mx-auto mb-4 h-16 w-16 text-neutral-400"
                />
                <p class="text-lg text-neutral-600">
                  No content created yet
                </p>
              </div>
            </UCard>
          </div>

          <!-- Privacy Tab -->
          <div
            v-show="activeTab === 'privacy'"
            class="space-y-8"
          >
            <UCard
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-purple-500 to-purple-600 p-2">
                  <UIcon
                    name="i-heroicons-lock-closed"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">Privacy Settings</span>
              </h3>

              <DashboardProfileUpdatePrivacy
                @success="handleFormSuccess()"
                @cancel="activeTab = 'settings'"
              />
            </UCard>
          </div>

          <!-- Security Tab -->
          <div
            v-show="activeTab === 'security'"
            class="space-y-8"
          >
            <!-- Security Overview -->
            <UCard
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-orange-500 to-orange-600 p-2">
                  <UIcon
                    name="i-heroicons-shield-check"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Security Overview</span>
              </h3>

              <!-- Security Status Grid -->
              <div class="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                <!-- Account Security -->
                <div class="rounded-xl border border-orange-200 bg-linear-to-r from-orange-50 to-red-50 p-6 dark:border-orange-800 dark:from-orange-900/20 dark:to-red-900/20">
                  <h4 class="mb-4 flex items-center gap-2 font-semibold">
                    <UIcon
                      name="i-heroicons-lock-closed"
                      class="h-5 w-5 text-orange-500"
                    />
                    Account Security
                  </h4>
                  <div class="space-y-3">
                    <div
                      v-for="item in [
                        { label: 'Email Verified', status: securityInfo?.email_verified || !!profileForView?.email_verified_at, icon: 'i-heroicons-envelope' },
                        { label: 'Strong Password', status: securityInfo?.password_strength === 'strong', icon: 'i-heroicons-key' },
                        { label: 'Two-Factor Auth', status: twoFactorStatus?.enabled ?? false, icon: 'i-heroicons-device-phone-mobile' }
                      ]"
                      :key="item.label"
                      class="flex items-center justify-between"
                    >
                      <div class="flex items-center gap-2">
                        <UIcon
                          :name="item.icon"
                          class="h-4 w-4 text-orange-500"
                        />
                        <span class="text-sm font-medium">{{ item.label }}</span>
                      </div>
                      <UIcon
                        :name="item.status ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                        :class="item.status ? 'text-success-500' : 'text-error-500'"
                        class="h-5 w-5"
                      />
                    </div>
                  </div>
                </div>

                <!-- Session Info -->
                <div class="rounded-xl border border-blue-200 bg-linear-to-r from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <h4 class="mb-4 flex items-center gap-2 font-semibold">
                    <UIcon
                      name="i-heroicons-computer-desktop"
                      class="h-5 w-5 text-blue-500"
                    />
                    Session Security
                  </h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Active Sessions</span>
                      <span class="text-sm text-blue-600">{{ securityInfo?.active_sessions_count || 0 }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Last Password Change</span>
                      <span class="text-sm text-blue-600">{{ lastPasswordChangeLabel }}</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Failed Login Attempts (24h)</span>
                      <span :class="`text-sm ${(securityInfo?.failed_login_attempts || 0) > 0 ? 'text-error-600' : 'text-success-600'}`">
                        {{ securityInfo?.failed_login_attempts || 0 }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- User Roles & Permissions -->
                <div class="rounded-xl border border-purple-200 bg-linear-to-r from-purple-50 to-indigo-50 p-6 dark:border-purple-800 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <h4 class="mb-4 flex items-center gap-2 font-semibold">
                    <UIcon
                      name="i-heroicons-key"
                      class="h-5 w-5 text-purple-500"
                    />
                    Account Permissions
                  </h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium">Account Type</span>
                      <span class="text-sm text-purple-600">{{ securityInfo?.account_type || (profileForView?.roles?.length ? 'Advanced User' : 'Basic User') }}</span>
                    </div>
                    <div class="space-y-2">
                      <span class="text-sm font-medium">Assigned Roles:</span>
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="role in (securityInfo?.roles || profileForView?.roles || []).map((r: any) => r.slug || r.name)"
                          :key="role"
                          class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"
                        >
                          <UIcon
                            :name="getRoleIcon(role)"
                            class="h-3 w-3"
                          />
                          {{ getRoleName(role) }}
                        </div>
                        <div
                          v-if="(!securityInfo?.roles || securityInfo.roles.length === 0) && (!profileForView?.roles || profileForView.roles.length === 0)"
                          class="text-xs text-neutral-500 italic"
                        >
                          No special roles assigned
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Two-Factor Authentication -->
            <UCard
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-green-500 to-green-600 p-2">
                  <UIcon
                    name="i-heroicons-shield-check"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-green-600 to-green-500 bg-clip-text text-transparent">Two-Factor Authentication (Funkcja nieaktywna)</span>
              </h3>

              <DashboardProfileSecurity2FA />
            </UCard>

            <!-- Failed Login Attempts -->
            <UCard
              v-if="securityInfo?.failed_login_attempts_recent && securityInfo.failed_login_attempts_recent.length > 0"
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-red-500 to-red-600 p-2">
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Ostatnie nieudane próby logowania</span>
              </h3>

              <div class="space-y-3">
                <div
                  v-for="(attempt, attemptIndex) in securityInfo.failed_login_attempts_recent"
                  :key="attempt.id ?? attemptIndex"
                  class="flex items-center justify-between rounded-lg border border-error-200 bg-error-50 px-4 py-3 dark:border-error-800 dark:bg-error-900/20"
                >
                  <div class="flex items-center gap-3">
                    <UIcon
                      name="i-heroicons-x-circle"
                      class="h-5 w-5 text-error-600"
                    />
                    <div>
                      <span class="font-mono text-sm font-semibold">{{ attempt.ip_address || 'Unknown' }}</span>
                      <p class="text-xs text-error-600 dark:text-error-400">
                        {{ attempt.user_agent || 'Unknown device' }}
                      </p>
                    </div>
                  </div>
                  <span class="text-sm font-medium text-error-600">{{ formatRelativeTime(attempt.attempted_at ?? '') }}</span>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Account Tab -->
          <div
            v-show="activeTab === 'account'"
            class="space-y-8"
          >
            <UCard
              variant="subtle"
              :hover="true"
              class="transition-all duration-300"
            >
              <h3 class="mb-6 flex items-center gap-3 text-xl font-bold">
                <div class="rounded-lg bg-linear-to-r from-red-500 to-red-600 p-2">
                  <UIcon
                    name="i-heroicons-user-circle"
                    class="h-6 w-6 text-white"
                  />
                </div>
                <span class="bg-linear-to-r from-red-600 to-red-500 bg-clip-text text-transparent">Zarządzanie kontem</span>
              </h3>

              <DashboardProfileAccountActions />
            </UCard>
          </div>
        </div>
      </template>

      <template #sidebar>
        <div class="space-y-6 p-6">
          <!-- Quick Actions -->
          <UCard
            variant="subtle"
            padding="lg"
            rounded="xl"
            class="bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-100 dark:border-neutral-700"
          >
            <div class="space-y-6">
              <div class="flex items-center space-x-3">
                <UIcon
                  name="i-heroicons-bolt"
                  class="h-5 w-5 text-primary-600 dark:text-primary-400"
                />
                <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Quick Actions
                </h3>
              </div>

              <div class="space-y-2">
                <UButton
                  variant="ghost"
                  color="primary"
                  size="sm"
                  block
                  class="justify-start text-left hover:bg-primary-50 dark:hover:bg-primary-900/20"
                  @click="goToAccountActions"
                >
                  <UIcon
                    name="i-heroicons-arrow-down-tray"
                    class="mr-3 h-4 w-4"
                  />
                  Download Data
                </UButton>

                <UButton
                  variant="ghost"
                  color="secondary"
                  size="sm"
                  block
                  class="justify-start text-left hover:bg-neutral-100 dark:hover:bg-neutral-700/50"
                  @click="handlePrivacySettings"
                >
                  <UIcon
                    name="i-heroicons-shield-check"
                    class="mr-3 h-4 w-4"
                  />
                  Privacy Settings
                </UButton>

                <UButton
                  variant="ghost"
                  color="warning"
                  size="sm"
                  block
                  class="justify-start text-left hover:bg-warning-50 dark:hover:bg-warning-900/20"
                  @click="goToAccountActions"
                >
                  <UIcon
                    name="i-heroicons-user-circle"
                    class="mr-3 h-4 w-4"
                  />
                  Zarządzanie kontem
                </UButton>
              </div>
            </div>
          </UCard>

          <!-- Account Stats -->
          <UCard
            variant="subtle"
            padding="lg"
            rounded="xl"
            class="border border-neutral-200 dark:border-neutral-700"
          >
            <div class="space-y-6">
              <div class="flex items-center space-x-3">
                <UIcon
                  name="i-heroicons-chart-bar"
                  class="h-5 w-5 text-primary-600 dark:text-primary-400"
                />
                <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  Account Stats
                </h3>
              </div>

              <div class="space-y-4">
                <div class="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Member since
                  </span>
                  <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {{ profileForView?.created_at ? new Date(profileForView.created_at).toLocaleDateString() : 'N/A' }}
                  </span>
                </div>

                <div class="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Profile completeness
                  </span>
                  <div class="flex items-center space-x-2">
                    <div class="w-16 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-success-500 rounded-full transition-all duration-300"
                        :style="`width: ${profileCompleteness}%`"
                      />
                    </div>
                    <span class="text-sm font-semibold text-success-600 dark:text-success-400">
                      {{ profileCompleteness }}%
                    </span>
                  </div>
                </div>

                <div class="flex justify-between items-center py-2">
                  <span class="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    Last login
                  </span>
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-success-500 rounded-full" />
                    <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      Today
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Account Security Status -->
          <UCard
            variant="subtle"
            padding="lg"
            rounded="xl"
            class="border-success-200 dark:border-success-700 bg-success-50/30 dark:bg-success-900/10"
          >
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <UIcon
                  name="i-heroicons-shield-check"
                  class="h-5 w-5 text-success-600 dark:text-success-400"
                />
                <h3 class="text-sm font-semibold text-success-900 dark:text-success-100">
                  Security Status
                </h3>
              </div>

              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <UIcon
                    :name="profileForView?.email_verified_at ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'"
                    :class="profileForView?.email_verified_at ? 'text-success-500' : 'text-error-500'"
                    class="h-4 w-4"
                  />
                  <span class="text-xs text-success-700 dark:text-success-300">
                    Email {{ profileForView?.email_verified_at ? 'verified' : 'not verified' }}
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <UIcon
                    name="i-heroicons-check-circle"
                    class="h-4 w-4 text-success-500"
                  />
                  <span class="text-xs text-success-700 dark:text-success-300">
                    Strong password configured
                  </span>
                </div>
                <div class="flex items-center space-x-2">
                  <UIcon
                    name="i-heroicons-x-circle"
                    class="h-4 w-4 text-error-500"
                  />
                  <span class="text-xs text-error-700 dark:text-error-300">
                    Two-factor authentication disabled
                  </span>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
