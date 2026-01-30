import type { CommandPaletteGroup } from '@nuxt/ui'

export const useDashboardSearch = () => {
  const groups = computed<CommandPaletteGroup[]>(() => {
    return [
      {
        id: 'portfolio',
        key: 'portfolio',
        label: 'Portfolio',
        items: [
          {
            label: 'Wszystkie projekty',
            icon: 'i-lucide-grid',
            to: '/dashboard/portfolio',
            description: 'Zarządzaj wszystkimi projektami portfolio'
          },
          {
            label: 'Dodaj projekt',
            icon: 'i-lucide-plus',
            to: '/dashboard/portfolio/create',
            description: 'Utwórz nowy projekt portfolio'
          }
        ]
      },
      {
        id: 'blog',
        key: 'blog',
        label: 'Blog',
        items: [
          {
            label: 'Wszystkie posty',
            icon: 'i-lucide-file-text',
            to: '/dashboard/blog',
            description: 'Zarządzaj wszystkimi postami blogowymi'
          },
          {
            label: 'Dodaj post',
            icon: 'i-lucide-plus',
            to: '/dashboard/blog/create',
            description: 'Utwórz nowy post blogowy'
          }
        ]
      },
      {
        id: 'services',
        key: 'services',
        label: 'Usługi',
        items: [
          {
            label: 'Wszystkie usługi',
            icon: 'i-lucide-list',
            to: '/dashboard/services',
            description: 'Zarządzaj wszystkimi usługami'
          }
        ]
      },
      {
        id: 'settings',
        key: 'settings',
        label: 'Ustawienia',
        items: [
          {
            label: 'Ustawienia ogólne',
            icon: 'i-lucide-settings',
            to: '/dashboard/settings',
            description: 'Zarządzaj ustawieniami aplikacji'
          },
          {
            label: 'Profil',
            icon: 'i-lucide-user',
            to: '/dashboard/profile',
            description: 'Edytuj swój profil użytkownika'
          },
          {
            label: 'Zespół',
            icon: 'i-lucide-users',
            to: '/dashboard/settings/team',
            description: 'Zarządzaj zespołem użytkowników'
          }
        ]
      },
      {
        id: 'navigation',
        key: 'navigation',
        label: 'Nawigacja',
        items: [
          {
            label: 'Dashboard',
            icon: 'i-lucide-layout-dashboard',
            to: '/dashboard',
            description: 'Strona główna dashboardu'
          },
          {
            label: 'Analytics',
            icon: 'i-lucide-bar-chart',
            to: '/dashboard/analytics',
            description: 'Statystyki i analityka'
          }
        ]
      }
    ]
  })

  return {
    groups
  }
}
