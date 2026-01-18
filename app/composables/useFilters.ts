/**
 * Globalny composable do zarządzania stanem filtrów
 * Umożliwia otwieranie/zamykanie panelu filtrów oraz rejestrację stron z filtrami
 */

// Globalny stan (singleton pattern)
const isOpen = ref(false)
const hasFilters = ref(false)
let registeredCount = 0

/**
 * Composable do zarządzania globalnym systemem filtrów
 *
 * @example
 * ```ts
 * // W komponencie/stronie z filtrami:
 * const filters = useFilters()
 *
 * onMounted(() => {
 *   filters.register()
 * })
 *
 * onUnmounted(() => {
 *   filters.unregister()
 * })
 *
 * // W Header:
 * const filters = useFilters()
 * const showButton = computed(() => filters.hasFilters)
 * ```
 */
export function useFilters() {
  const route = useRoute()

  // Zamykanie przy zmianie route
  watch(() => route.path, () => {
    if (isOpen.value) {
      close()
    }
  })

  /**
   * Otwiera panel filtrów
   */
  const open = () => {
    isOpen.value = true
  }

  /**
   * Zamyka panel filtrów
   */
  const close = () => {
    isOpen.value = false
  }

  /**
   * Przełącza stan otwarty/zamknięty
   */
  const toggle = () => {
    if (isOpen.value) {
      close()
    } else {
      open()
    }
  }

  /**
   * Rejestruje stronę/sekcję jako mającą filtry
   * Wywołaj w onMounted komponentu, który ma filtry
   */
  const register = () => {
    registeredCount++
    hasFilters.value = true
  }

  /**
   * Wyrejestrowuje stronę/sekcję
   * Wywołaj w onUnmounted komponentu
   */
  const unregister = () => {
    registeredCount--
    if (registeredCount <= 0) {
      registeredCount = 0
      hasFilters.value = false
      // Zamykamy drawer jeśli był otwarty
      if (isOpen.value) {
        close()
      }
    }
  }

  return {
    isOpen: readonly(isOpen),
    hasFilters: readonly(hasFilters),
    open,
    close,
    toggle,
    register,
    unregister
  }
}
