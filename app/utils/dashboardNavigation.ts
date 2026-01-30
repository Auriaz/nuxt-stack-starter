import type { NavigationMenuItem } from '@nuxt/ui'

type DashboardNavigationItem = NavigationMenuItem & {
  adminOnly?: boolean
}

export const getDashboardMenuItems = (hasAdminRole: boolean = false): NavigationMenuItem[][] => {
  const items: DashboardNavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard',
      active: false
    },
    {
      label: 'Profil',
      icon: 'i-lucide-user',
      to: '/dashboard/profile',
      active: false
    },
    {
      label: 'Powiadomienia',
      icon: 'i-lucide-bell',
      to: '/dashboard/notifications',
      active: false
    },
    {
      label: 'Media',
      icon: 'i-lucide-image',
      to: '/dashboard/media',
      active: false
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

  const filteredItems: NavigationMenuItem[] = hasAdminRole
    ? items
    : items.filter(item => !item.adminOnly)

  return [[
    ...filteredItems
  ]]
}
