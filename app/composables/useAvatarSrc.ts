import type { MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'

/**
 * Zwraca pełny URL avatara (origin + ścieżka).
 * Ścieżki względne (np. /api/media/:id/serve) wymagają pełnego URL,
 * żeby UAvatar/img poprawnie ładowały obraz (SSR i kontekst requestu).
 */
export function useAvatarSrc(avatarUrl: MaybeRefOrGetter<string | null | undefined>): ComputedRef<string | undefined> {
  const requestURL = useRequestURL()
  return computed(() => {
    const url = toValue(avatarUrl)
    if (!url || typeof url !== 'string') return undefined
    if (url.startsWith('/')) return requestURL.origin + url
    return url
  })
}
