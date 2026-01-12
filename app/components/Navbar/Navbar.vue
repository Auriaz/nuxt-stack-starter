<script lang="ts" setup>
import { menuItems as baseMenuItems } from '~/utils/navbar'
import type { NavigationMenuItem } from '@nuxt/ui'

defineProps({
  orientation: {
    type: String as PropType<'vertical' | 'horizontal'>,
    default: 'horizontal'
  }
})

const route = useRoute()

// Funkcja do sprawdzania, czy ścieżka pasuje do trasy
const isRouteActive = (
  itemPath: string | undefined,
  currentPath: string | undefined,
  currentRoute: string
): boolean => {
  if (!itemPath || !currentPath) return false

  const cleanItemPath = itemPath.split('#')[0]?.split('?')[0] || ''
  const cleanCurrentPath = currentPath.split('#')[0]?.split('?')[0] || ''

  // Dokładne dopasowanie ścieżki
  if (cleanItemPath !== cleanCurrentPath) return false

  // Sprawdź query params
  const itemQuery = itemPath.includes('?') ? itemPath.split('?')[1]?.split('#')[0] : null
  const routeQuery = currentRoute.includes('?') ? currentRoute.split('?')[1]?.split('#')[0] : null

  // Jeśli itemPath ma query params, sprawdź czy pasują
  if (itemQuery) {
    if (!routeQuery) return false

    // Porównaj parametry query
    const itemParams = new URLSearchParams(itemQuery)
    const routeParams = new URLSearchParams(routeQuery)

    // Sprawdź czy wszystkie parametry z itemPath są w route
    for (const [key, value] of itemParams.entries()) {
      if (routeParams.get(key) !== value) {
        return false
      }
    }
  } else {
    // Jeśli itemPath nie ma query params
    // Dla ścieżek bez query params (np. /portfolio), akceptuj zarówno z jak i bez query params w route
    // Ale tylko jeśli to nie jest główna strona (główna strona zawsze pasuje)
    if (routeQuery && cleanItemPath === '/') return true
    // Dla innych ścieżek bez query params, akceptuj tylko jeśli route też nie ma query params
    if (routeQuery && cleanItemPath !== '/') return false
  }

  // Jeśli itemPath ma hash, sprawdź czy pasuje do currentRoute
  if (itemPath.includes('#')) {
    const itemHash = itemPath.split('#')[1]?.split('?')[0]
    const routeHash = currentRoute.includes('#')
      ? currentRoute.split('#')[1]?.split('?')[0]
      : null
    return itemHash === routeHash
  }

  // Jeśli itemPath nie ma hasha, ale currentRoute ma hash, to nie pasuje (chyba że to główna strona)
  if (cleanItemPath === '/' && cleanCurrentPath === '/') return true
  if (currentRoute.includes('#') && !itemPath.includes('#')) return false

  return true
}

// Funkcja do znajdowania najlepiej dopasowanego elementu
const findBestMatch = (
  items: NavigationMenuItem[],
  currentPath: string | undefined,
  currentRoute: string
): NavigationMenuItem | null => {
  if (!currentPath) return null

  let bestMatch: NavigationMenuItem | null = null
  let bestMatchScore = -1

  const checkItem = (item: NavigationMenuItem) => {
    if (!item.to) return

    const isActive = isRouteActive(item.to as string, currentPath, currentRoute)
    if (isActive) {
      // Oblicz score - im bardziej szczegółowy, tym wyższy score
      const itemPath = item.to as string
      let score = itemPath.length
      // Bonus za hash (bardziej szczegółowy)
      if (itemPath.includes('#')) score += 1000
      // Bonus za query params
      if (itemPath.includes('?')) score += 500

      if (score > bestMatchScore) {
        bestMatchScore = score
        bestMatch = item
      }
    }

    if (item.children) {
      item.children.forEach(child => checkItem(child))
    }
  }

  items.forEach(item => checkItem(item))
  return bestMatch
}

// Funkcja do ustawiania aktywnych elementów (tylko najlepiej dopasowany)
const setActiveItems = (
  items: NavigationMenuItem[],
  currentPath: string | undefined,
  currentRoute: string,
  bestMatch: NavigationMenuItem | null
): NavigationMenuItem[] => {
  if (!currentPath) return items

  return items.map((item) => {
    const isActive = bestMatch === item
    const hasActiveChild = item.children?.some(child => bestMatch === child)

    return {
      ...item,
      active: isActive || hasActiveChild || false,
      children: item.children
        ? setActiveItems(item.children, currentPath, currentRoute, bestMatch)
        : undefined
    }
  })
}

// Computed property dla menuItems z aktywnymi elementami
const menuItems = computed<NavigationMenuItem[]>(() => {
  const currentRoute = route?.fullPath || route?.path || ''
  const currentPath = route?.path
  const bestMatch = findBestMatch(
    baseMenuItems as NavigationMenuItem[],
    currentPath,
    currentRoute
  )
  return setActiveItems(
    baseMenuItems as NavigationMenuItem[],
    currentPath,
    currentRoute,
    bestMatch
  )
})
</script>

<template>
  <UNavigationMenu
    color="primary"
    :items="menuItems"
    :orientation="orientation"
    class="w-full justify-center"
  />
</template>
