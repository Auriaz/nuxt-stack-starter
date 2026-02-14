import type {
  EventCategoryDTO,
  CreateEventCategoryInput,
  UpdateEventCategoryInput,
  EventCategoryScope
} from '#shared/types/event-category'
import { useApiClient } from './useApiClient'

export interface ListCategoriesParams {
  scope?: EventCategoryScope
  teamId?: number
}

export function useEventCategoriesResource() {
  const apiClient = useApiClient()

  const listCategories = async (params?: ListCategoriesParams): Promise<EventCategoryDTO[]> => {
    const query = new URLSearchParams()

    if (params?.scope) {
      query.set('scope', params.scope)
    }
    if (params?.teamId) {
      query.set('teamId', String(params.teamId))
    }

    const queryString = query.toString()
    const url = queryString ? `/api/event-categories?${queryString}` : '/api/event-categories'

    // API zwraca { data: EventCategoryDTO[], meta: { ... } }
    return await apiClient.request<EventCategoryDTO[]>(url)
  }

  const createCategory = async (input: CreateEventCategoryInput): Promise<EventCategoryDTO> => {
    return await apiClient.request<EventCategoryDTO>('/api/event-categories', {
      method: 'POST',
      body: input
    })
  }

  const updateCategory = async (id: number, input: UpdateEventCategoryInput): Promise<EventCategoryDTO> => {
    return await apiClient.request<EventCategoryDTO>(`/api/event-categories/${id}`, {
      method: 'PATCH',
      body: input
    })
  }

  const deleteCategory = async (id: number): Promise<void> => {
    await apiClient.request<{ success: boolean }>(`/api/event-categories/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    listCategories,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
