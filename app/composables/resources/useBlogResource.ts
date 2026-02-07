import type {
  BlogPostDTO,
  BlogListResponse,
  BlogListQuery,
  BlogPostCreateInput,
  BlogPostUpdateInput,
  BlogTagDTO
} from '#shared/types/blog'
import { useApiClient } from './useApiClient'

export function useBlogResource() {
  const apiClient = useApiClient()

  /** Publiczna lista opublikowanych postów (GET /api/blog) */
  async function listPublic(query?: BlogListQuery): Promise<BlogListResponse | null> {
    const params = new URLSearchParams()
    if (query?.page != null) params.set('page', String(query.page))
    if (query?.perPage != null) params.set('perPage', String(query.perPage))
    if (query?.search) params.set('search', query.search)
    if (query?.tags?.length) query.tags.forEach(t => params.append('tags', t))
    const q = params.toString()
    const url = q ? `/api/blog?${q}` : '/api/blog'
    try {
      return await apiClient.request<BlogListResponse>(url)
    } catch {
      return null
    }
  }

  /** Publiczny pojedynczy post po slug (GET /api/blog/:slug) */
  async function getBySlug(slug: string): Promise<BlogPostDTO | null> {
    try {
      return await apiClient.request<BlogPostDTO>(`/api/blog/${encodeURIComponent(slug)}`)
    } catch {
      return null
    }
  }

  /** Lista postów w dashboardzie (GET /api/dashboard/blog) */
  async function listDashboard(query?: BlogListQuery): Promise<BlogListResponse | null> {
    const params = new URLSearchParams()
    if (query?.page != null) params.set('page', String(query.page))
    if (query?.perPage != null) params.set('perPage', String(query.perPage))
    if (query?.search) params.set('search', query.search)
    if (query?.tags?.length) query.tags.forEach(t => params.append('tags', t))
    if (query?.status) params.set('status', query.status)
    const q = params.toString()
    const url = q ? `/api/dashboard/blog?${q}` : '/api/dashboard/blog'
    try {
      return await apiClient.request<BlogListResponse>(url)
    } catch {
      return null
    }
  }

  /** Pojedynczy post w dashboardzie (GET /api/dashboard/blog/:id) */
  async function getById(id: number): Promise<BlogPostDTO | null> {
    try {
      return await apiClient.request<BlogPostDTO>(`/api/dashboard/blog/${id}`)
    } catch {
      return null
    }
  }

  /** Tworzenie postu (POST /api/dashboard/blog) */
  async function create(payload: BlogPostCreateInput): Promise<BlogPostDTO | null> {
    return await apiClient.request<BlogPostDTO>('/api/dashboard/blog', {
      method: 'POST',
      body: payload
    })
  }

  /** Aktualizacja postu (PATCH /api/dashboard/blog/:id) */
  async function update(id: number, payload: BlogPostUpdateInput): Promise<BlogPostDTO | null> {
    try {
      return await apiClient.request<BlogPostDTO>(`/api/dashboard/blog/${id}`, {
        method: 'PATCH',
        body: payload
      })
    } catch {
      return null
    }
  }

  /** Usunięcie postu (DELETE /api/dashboard/blog/:id) */
  async function remove(id: number): Promise<boolean> {
    try {
      await apiClient.request<{ ok: true }>(`/api/dashboard/blog/${id}`, { method: 'DELETE' })
      return true
    } catch {
      return false
    }
  }

  /** Ścieżka publiczna postu */
  function postPath(post: { slug: string }): string {
    return `/blog/${post.slug}`
  }

  /** Lista tagów (GET /api/dashboard/blog/tags) */
  async function listTags(): Promise<BlogTagDTO[]> {
    try {
      const res = await apiClient.request<BlogTagDTO[]>('/api/dashboard/blog/tags')
      return Array.isArray(res) ? res : []
    } catch {
      return []
    }
  }

  /** Sprawdzenie czy slug jest zajęty (GET /api/dashboard/blog/slug-exists) */
  async function slugExists(slug: string): Promise<boolean> {
    const query = encodeURIComponent(slug.trim())
    const res = await apiClient.request<{ exists: boolean }>(`/api/dashboard/blog/slug-exists?slug=${query}`)
    return Boolean(res?.exists)
  }

  /** Utworzenie tagu (POST /api/dashboard/blog/tags). Jeśli istnieje (case-insensitive), zwraca istniejący. */
  async function createTag(name: string): Promise<BlogTagDTO | null> {
    try {
      return await apiClient.request<BlogTagDTO>('/api/dashboard/blog/tags', {
        method: 'POST',
        body: { name: name.trim() }
      })
    } catch {
      return null
    }
  }

  return {
    listPublic,
    getBySlug,
    listDashboard,
    getById,
    create,
    update,
    remove,
    postPath,
    listTags,
    createTag,
    slugExists
  }
}
