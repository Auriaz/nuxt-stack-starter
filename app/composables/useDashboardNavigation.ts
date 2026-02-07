import type { NavigationMenuItem } from '@nuxt/ui'
import { PERMISSIONS } from '#shared/permissions'
import { getDashboardMenuItems } from '~/utils/dashboardNavigation'

export const useDashboardNavigation = () => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { isLoggedIn, can } = useAccess()

  const menuItems = computed<NavigationMenuItem[][]>(() => {
    const hasAdminRole = isLoggedIn.value && can(PERMISSIONS.ADMIN_ACCESS)
    const showAnalytics = config.public.analyticsEnabled === true && can(PERMISSIONS.ANALYTICS_READ)
    const hasContentManage = isLoggedIn.value && can(PERMISSIONS.CONTENT_MANAGE)
    const itemsGroups = getDashboardMenuItems({ hasAdminRole, showAnalytics, hasContentManage })

    // Ustaw aktywny element na podstawie aktualnej trasy
    const setActive = (items: NavigationMenuItem[]): NavigationMenuItem[] => {
      return items.map((item) => {
        const isActive = Boolean(route.path === item.to || (item.to && route.path.startsWith(item.to + '/')))
        const children = item.children ? setActive(item.children) : undefined

        return {
          ...item,
          active: isActive ? true : undefined,
          children
        }
      })
    }

    // Zastosuj setActive do każdej grupy menu
    return itemsGroups.map(group => setActive(group))
  })

  return {
    menuItems
  }
}
