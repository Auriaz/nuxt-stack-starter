import type {
  MediaAssetDTO,
  MediaListQuery,
  MediaListResponse,
  UpdateMediaMetadata
} from '#shared/types'
import { useApiClient } from './useApiClient'

export function useMediaResource() {
  const apiClient = useApiClient()

  async function upload(
    file: File,
    meta?: { alt?: string, caption?: string, tags?: string[] }
  ): Promise<MediaAssetDTO | null> {
    const formData = new FormData()
    formData.append('file', file)
    if (meta?.alt) formData.append('alt', meta.alt)
    if (meta?.caption) formData.append('caption', meta.caption)
    if (meta?.tags?.length) {
      meta.tags.forEach(tag => formData.append('tags', tag))
    }
    try {
      return await apiClient.request<MediaAssetDTO>('/api/media/upload', {
        method: 'POST',
        body: formData
      })
    } catch {
      return null
    }
  }

  async function list(params: MediaListQuery): Promise<MediaListResponse | null> {
    const searchParams = new URLSearchParams()
    if (params.type) searchParams.set('type', params.type)
    if (params.search) searchParams.set('search', params.search)
    if (params.tags?.length) params.tags.forEach(t => searchParams.append('tags', t))
    if (params.page != null) searchParams.set('page', String(params.page))
    if (params.perPage != null) searchParams.set('perPage', String(params.perPage))
    const query = searchParams.toString()
    const url = query ? `/api/media?${query}` : '/api/media'
    try {
      const data = await apiClient.request<MediaListResponse>(url)
      return data
    } catch {
      return null
    }
  }

  async function get(id: string): Promise<MediaAssetDTO | null> {
    try {
      return await apiClient.request<MediaAssetDTO>(`/api/media/${id}`)
    } catch {
      return null
    }
  }

  async function update(id: string, payload: UpdateMediaMetadata): Promise<MediaAssetDTO | null> {
    try {
      return await apiClient.request<MediaAssetDTO>(`/api/media/${id}`, {
        method: 'PATCH',
        body: payload
      })
    } catch {
      return null
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await apiClient.request<{ ok: true }>(`/api/media/${id}`, { method: 'DELETE' })
      return true
    } catch {
      return false
    }
  }

  function serveUrl(id: string): string {
    return `/api/media/${id}/serve`
  }

  return {
    upload,
    list,
    get,
    update,
    remove,
    serveUrl
  }
}
