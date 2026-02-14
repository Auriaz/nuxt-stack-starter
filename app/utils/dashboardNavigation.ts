import type { NavigationMenuItem } from '@nuxt/ui'

type DashboardNavigationItem = NavigationMenuItem & {
  adminOnly?: boolean
  analyticsOnly?: boolean
  contentManageOnly?: boolean
  categoryManageOnly?: boolean
}

export interface DashboardMenuOptions {
  hasAdminRole?: boolean
  showAnalytics?: boolean
  hasContentManage?: boolean
  hasCategoryManage?: boolean
}

export const getDashboardMenuItems = (options: boolean | DashboardMenuOptions = false): NavigationMenuItem[][] => {
  const opts: DashboardMenuOptions = typeof options === 'boolean' ? { hasAdminRole: options } : options
  const hasAdminRole = opts.hasAdminRole ?? false
  const showAnalytics = opts.showAnalytics ?? false
  const hasContentManage = opts.hasContentManage ?? false
  const hasCategoryManage = opts.hasCategoryManage ?? false

  const baseItems: DashboardNavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
      active: false
    },
    {
      label: 'Kalendarz',
      icon: 'i-lucide-calendar-days',
      to: '/dashboard/calendar',
      active: false
    },
    {
      label: 'Czat',
      icon: 'i-lucide-message-square',
      to: '/dashboard/chat',
      active: false
    },
    {
      label: 'Znajomi',
      icon: 'i-lucide-user-plus',
      to: '/dashboard/friends',
      active: false
    },
    {
      label: 'Zespoly',
      icon: 'i-lucide-users-2',
      to: '/dashboard/teams',
      active: false
    },
    {
      label: 'Media',
      icon: 'i-lucide-image',
      to: '/dashboard/media',
      active: false
    },
    {
      label: 'Kategorie',
      icon: 'i-lucide-tags',
      to: '/dashboard/categories',
      categoryManageOnly: true,
      active: false
    },
    {
      label: 'Blog',
      icon: 'i-lucide-book-open',
      to: '/dashboard/blog',
      contentManageOnly: true,
      active: false
    },
    {
      label: 'Treści (Studio)',
      icon: 'i-lucide-file-edit',
      contentManageOnly: true,
      // Pełne przeładowanie — Studio jest obsługiwane przez Nitro, nie Vue Router
      onSelect: () => navigateTo('/_studio', { external: true })
    }
    // {
    //   label: 'Portfolio',
    //   icon: 'i-lucide-folder-kanban',
    //   to: '/dashboard/portfolio',
    //   defaultOpen: true,
    //   children: [
    //     {
    //       label: 'Wszystkie projekty',
    //       icon: 'i-lucide-grid',
    //       to: '/dashboard/portfolio'
    //     },
    //     {
    //       label: 'Dodaj projekt',
    //       icon: 'i-lucide-plus',
    //       to: '/dashboard/portfolio/create'
    //     }
    //   ]
    // },
    // {
    //   label: 'Blog',
    //   icon: 'i-lucide-book-open',
    //   to: '/dashboard/blog',
    //   defaultOpen: true,
    //   children: [
    //     {
    //       label: 'Wszystkie posty',
    //       icon: 'i-lucide-file-text',
    //       to: '/dashboard/blog'
    //     },
    //     {
    //       label: 'Dodaj post',
    //       icon: 'i-lucide-plus',
    //       to: '/dashboard/blog/create'
    //     }
    //   ]
    // },
    // {
    //   label: 'Usługi',
    //   icon: 'i-lucide-briefcase',
    //   to: '/dashboard/services'
    // },
    // {
    //   label: 'Briefy projektowe',
    //   icon: 'i-lucide-file-text',
    //   to: '/dashboard/admin/briefs',
    //   adminOnly: true
    // }
  ]

  const filteredItems: NavigationMenuItem[] = baseItems.filter((item) => {
    if (item.adminOnly && !hasAdminRole) return false
    if (item.analyticsOnly && !showAnalytics) return false
    if (item.contentManageOnly && !hasContentManage) return false
    if (item.categoryManageOnly && !hasCategoryManage) return false
    return true
  })

  return [[
    ...filteredItems
  ]]
}

/** Kontekst wymagany do zbudowania menu użytkownika (dropdown w sidebar/header) */
export interface DashboardFooterMenuContext {
  userEmail: string
  avatarSrc: string | undefined
  fullName: string
  initials: string
  routePath: string
  routeQuery: Record<string, unknown>
  hasAdminRole: boolean
  showAnalytics?: boolean
  onLogout: () => void | Promise<void>
}

/**
 * Zwraca grupy pozycji menu dla dropdown użytkownika (jedna źródłowa definicja nawigacji).
 * Kontekst (user, route, logout) przekazuje komponent wywołujący.
 */
export const getDashboardMenuItemsForFooter = (context: DashboardFooterMenuContext): NavigationMenuItem[][] => {
  const {
    userEmail,
    avatarSrc,
    fullName,
    initials,
    routePath,
    routeQuery,
    hasAdminRole,
    onLogout
  } = context

  const isProfile = routePath === '/dashboard/profile'
  const isSettings = routePath === '/dashboard/settings'
  const tab = (routeQuery.tab as string) ?? ''

  return [
    // Sekcja 1: Nagłówek z avatarem i emailem
    [
      {
        label: userEmail || '',
        slot: 'account',
        disabled: true,
        avatar: {
          src: avatarSrc,
          alt: fullName,
          text: initials
        }
      }
    ],
    // Sekcja 2: Profil
    [
      {
        label: 'Mój profil',
        icon: 'i-heroicons-user-circle',
        to: '/dashboard/profile',
        children: [
          { label: 'Przegląd', icon: 'i-heroicons-home', to: '/dashboard/profile?tab=overview', active: isProfile && (tab === 'overview' || !tab) },
          { label: 'Ustawienia', icon: 'i-heroicons-cog-6-tooth', to: '/dashboard/profile?tab=settings', active: isProfile && tab === 'settings' },
          { label: 'Bezpieczeństwo', icon: 'i-heroicons-shield-check', to: '/dashboard/profile?tab=security', active: isProfile && tab === 'security' },
          { label: 'Prywatność', icon: 'i-heroicons-lock-closed', to: '/dashboard/profile?tab=privacy', active: isProfile && tab === 'privacy' },
          { label: 'Aktywność', icon: 'i-heroicons-chart-bar', to: '/dashboard/profile?tab=activity', active: isProfile && tab === 'activity' },
          { label: 'Treść', icon: 'i-heroicons-document-text', to: '/dashboard/profile?tab=content', active: isProfile && tab === 'content' }
        ]
      }
    ],
    // Sekcja 3: Nawigacja
    [

      ...(hasAdminRole
        ? [{
            label: 'Analytics',
            icon: 'i-lucide-bar-chart',
            to: '/dashboard/analytics'
          },
          {
            label: 'Ustawienia',
            icon: 'i-lucide-settings',
            to: '/dashboard/settings',
            children: [
              { label: 'Ogólne', icon: 'i-lucide-settings', to: '/dashboard/settings?tab=general', active: isSettings && tab === 'general' },
              { label: 'Powiadomienia', icon: 'i-lucide-bell', to: '/dashboard/settings?tab=notifications', active: isSettings && tab === 'notifications' },
              { label: 'Prywatność', icon: 'i-lucide-lock', to: '/dashboard/settings?tab=privacy', active: isSettings && tab === 'privacy' },
              { label: 'Bezpieczeństwo', icon: 'i-lucide-shield', to: '/dashboard/settings?tab=security', active: isSettings && tab === 'security' },
              { label: 'Wygląd', icon: 'i-lucide-palette', to: '/dashboard/settings?tab=appearance', active: isSettings && tab === 'appearance' },
              { label: 'Integracje', icon: 'i-lucide-puzzle', to: '/dashboard/settings?tab=integrations', active: isSettings && tab === 'integrations' }
            ]
          },

          {
            label: 'Panel administracyjny',
            icon: 'i-heroicons-shield-check',
            to: '/dashboard/admin',
            children: [
              { label: 'Przegląd', icon: 'i-lucide-layout-dashboard', to: '/dashboard/admin' },
              { label: 'Użytkownicy', icon: 'i-lucide-users', to: '/dashboard/admin/users' },
              { label: 'Role', icon: 'i-lucide-shield', to: '/dashboard/admin/roles' },
              { label: 'Uprawnienia', icon: 'i-lucide-key', to: '/dashboard/admin/permissions' }
            ]
          }]
        : []),
      {
        label: 'Powiadomienia',
        icon: 'i-lucide-bell',
        to: '/dashboard/notifications'
      }
    ],
    // Sekcja 4: Wyloguj
    [
      {
        label: 'Wyloguj się',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        color: 'error' as const,
        onSelect: () => onLogout()
      }
    ]
  ]
}
