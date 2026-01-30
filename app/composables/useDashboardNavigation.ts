import type { NavigationMenuItem } from '@nuxt/ui'
import { getDashboardMenuItems } from '~/utils/dashboardNavigation'

export const useDashboardNavigation = () => {
  const route = useRoute()
  const { isLoggedIn, hasRole } = useAccess()

  const menuItems = computed<NavigationMenuItem[][]>(() => {
    // Sprawdź czy użytkownik ma rolę admin (tylko po stronie klienta)
    const hasAdminRole = isLoggedIn.value && hasRole('admin')
    const itemsGroups = getDashboardMenuItems(hasAdminRole)

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
