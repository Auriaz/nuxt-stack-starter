import type {
  ProfileDTO,
  UpdateProfileInput,
  UpdatePrivacyInput,
  UpdatePasswordInput
} from '#shared/types'
import { useApiClient } from './useApiClient'
import { useMediaResource } from './useMediaResource'

/** Współdzielony stan profilu (useState), żeby avatar/zmiany były widoczne w menu i na stronie profilu. */
export function useProfile() {
  const toast = useToast()
  const apiClient = useApiClient()
  const media = useMediaResource()
  const profile = useState<ProfileDTO | null>('profile', () => null)
  const stats = useState<unknown>('profile-stats', () => null)
  const content = useState<unknown>('profile-content', () => null)
  const isLoading = useState<boolean>('profile-loading', () => false)
  const errors = useState<Record<string, string>>('profile-errors', () => ({}))

  /** Czyści stan profilu (np. przy wylogowaniu lub logowaniu innego użytkownika). */
  function clearProfile(): void {
    profile.value = null
    stats.value = null
    content.value = null
    isLoading.value = false
    errors.value = {}
  }

  const fetchProfile = async (): Promise<ProfileDTO | null> => {
    try {
      isLoading.value = true
      errors.value = {}
      const data = await apiClient.request<ProfileDTO>('/api/profile/me')
      profile.value = data
      return data
    } catch (error: unknown) {
      const status = error && typeof error === 'object' && 'statusCode' in error ? (error.statusCode as number) : 0
      if (status === 401) {
        clearProfile()
        const { logout } = useAuth()
        await logout()
        return null
      }
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się pobrać profilu użytkownika' }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (data: UpdateProfileInput): Promise<ProfileDTO | null> => {
    try {
      isLoading.value = true
      errors.value = {}
      const updated = await apiClient.request<ProfileDTO>('/api/profile/me', {
        method: 'PATCH',
        body: data
      })
      profile.value = updated
      toast.add({
        title: 'Sukces',
        description: 'Profil został zaktualizowany pomyślnie',
        color: 'success'
      })
      return updated
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się zaktualizować profilu' }
      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji profilu',
        color: 'error'
      })
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updatePrivacy = async (data: UpdatePrivacyInput): Promise<boolean> => {
    try {
      isLoading.value = true
      errors.value = {}
      await apiClient.request<{ ok: boolean }>('/api/profile/privacy', {
        method: 'PATCH',
        body: data
      })
      if (profile.value && data.showEmail !== undefined) {
        profile.value = { ...profile.value, showEmail: data.showEmail }
      }
      toast.add({
        title: 'Sukces',
        description: 'Ustawienia prywatności zostały zaktualizowane.',
        color: 'success'
      })
      return true
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się zaktualizować ustawień prywatności' }
      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji ustawień prywatności',
        color: 'error'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  const updatePassword = async (data: UpdatePasswordInput): Promise<boolean> => {
    try {
      isLoading.value = true
      errors.value = {}
      await apiClient.request<unknown>('/api/profile/password', {
        method: 'PATCH',
        body: data
      })
      toast.add({
        title: 'Sukces',
        description: 'Hasło zostało zmienione pomyślnie.',
        color: 'success'
      })
      return true
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się zmienić hasła' }
      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas zmiany hasła',
        color: 'error'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  /** Wyciąga ID mediów z URL typu /api/media/:id/serve (relative lub absolute). */
  function getMediaIdFromAvatarUrl(url: string | null | undefined): string | null {
    if (!url || typeof url !== 'string') return null
    const m = url.match(/\/api\/media\/([^/]+)\/serve/)
    return m?.[1] ?? null
  }

  const uploadAvatar = async (file: File): Promise<string | null> => {
    try {
      isLoading.value = true
      errors.value = {}
      const oldAvatarUrl = profile.value?.avatarUrl
      const asset = await media.upload(file, { tags: ['avatar'] })
      if (!asset) {
        errors.value = { root: 'Nie udało się przesłać pliku do biblioteki mediów' }
        toast.add({
          title: 'Błąd',
          description: 'Nie udało się przesłać avatara',
          color: 'error'
        })
        return null
      }
      const avatarUrl = media.serveUrl(asset.id)
      const updated = await apiClient.request<ProfileDTO>('/api/profile/me', {
        method: 'PATCH',
        body: { avatarUrl }
      })
      profile.value = updated
      const oldId = getMediaIdFromAvatarUrl(oldAvatarUrl)
      if (oldId && oldId !== asset.id) {
        await media.remove(oldId)
      }
      toast.add({
        title: 'Sukces',
        description: 'Avatar został zaktualizowany pomyślnie.',
        color: 'success'
      })
      return updated?.avatarUrl ?? avatarUrl
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się przesłać avatara' }
      toast.add({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd podczas przesyłania avatara',
        color: 'error'
      })
      return null
    } finally {
      isLoading.value = false
    }
  }

  const setAvatarFromMedia = async (mediaId: string): Promise<boolean> => {
    const oldAvatarUrl = profile.value?.avatarUrl
    const avatarUrl = media.serveUrl(mediaId)
    const updated = await updateProfile({ avatarUrl })
    if (updated) {
      const oldId = getMediaIdFromAvatarUrl(oldAvatarUrl)
      if (oldId && oldId !== mediaId) {
        await media.remove(oldId)
      }
    }
    return updated != null
  }

  const deleteAvatar = async (): Promise<boolean> => {
    const oldAvatarUrl = profile.value?.avatarUrl
    const updated = await updateProfile({ avatarUrl: null })
    if (updated) {
      const oldId = getMediaIdFromAvatarUrl(oldAvatarUrl)
      if (oldId) {
        await media.remove(oldId)
      }
    }
    return updated != null
  }

  const fetchSecurity = async (): Promise<unknown> => {
    try {
      isLoading.value = true
      errors.value = {}
      return await apiClient.request<unknown>('/api/profile/security')
    } catch (error: unknown) {
      errors.value = { root: error instanceof Error ? error.message : 'Nie udało się pobrać informacji o bezpieczeństwie' }
      return null
    } finally {
      isLoading.value = false
    }
  }

  const emptyStats = () => ({ total_articles: 0, total_media: 0, total_comments: 0 })
  const emptyContent = () => ({
    recent_articles: [],
    recent_media: [],
    recent_comments: [],
    stats: emptyStats()
  })

  const fetchStats = async (): Promise<unknown> => {
    try {
      isLoading.value = true
      errors.value = {}
      const data = await apiClient.request<unknown>('/api/profile/stats')
      stats.value = data
      return data
    } catch {
      stats.value = emptyStats()
      return null
    } finally {
      isLoading.value = false
    }
  }

  const fetchContent = async (): Promise<unknown> => {
    try {
      isLoading.value = true
      errors.value = {}
      const data = await apiClient.request<unknown>('/api/profile/content')
      content.value = data
      return data
    } catch {
      content.value = emptyContent()
      return null
    } finally {
      isLoading.value = false
    }
  }

  const exportProfileData = async (): Promise<{ exportedAt: string, profile: ProfileDTO } | null> => {
    try {
      const data = await apiClient.request<{ exportedAt: string, profile: ProfileDTO }>('/api/profile/me/download')
      return data
    } catch {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się wyeksportować danych',
        color: 'error'
      })
      return null
    }
  }

  const deactivateAccount = async (): Promise<boolean> => {
    try {
      await apiClient.request<{ data: { ok: true } }>('/api/profile/me/deactivate', { method: 'POST' })
      return true
    } catch {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się dezaktywować konta',
        color: 'error'
      })
      return false
    }
  }

  const deleteAccount = async (): Promise<boolean> => {
    try {
      await apiClient.request<{ data: { ok: true } }>('/api/profile/me', { method: 'DELETE' })
      return true
    } catch {
      toast.add({
        title: 'Błąd',
        description: 'Nie udało się usunąć konta',
        color: 'error'
      })
      return false
    }
  }

  return {
    profile: readonly(profile),
    stats: readonly(stats),
    content: readonly(content),
    isLoading: readonly(isLoading),
    errors: readonly(errors),
    fetchProfile,
    updateProfile,
    updatePrivacy,
    updatePassword,
    uploadAvatar,
    setAvatarFromMedia,
    deleteAvatar,
    fetchSecurity,
    fetchStats,
    fetchContent,
    exportProfileData,
    deactivateAccount,
    deleteAccount,
    clearProfile
  }
}
