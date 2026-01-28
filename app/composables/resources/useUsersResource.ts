import type { UserOutput, CreateUserInput } from '#shared/types/api'
import { useApiClient } from './useApiClient'

/**
 * Resource composable dla operacji na użytkownikach
 *
 * Jedyny sposób, w jaki UI komunikuje się z API użytkowników.
 *
 * @example
 * ```ts
 * const { getUsers, createUser } = useUsersResource()
 * const users = await getUsers()
 * const newUser = await createUser({ username: 'john', email: 'john@example.com' })
 * ```
 */
export function useUsersResource() {
  const apiClient = useApiClient()

  async function getUsers(): Promise<UserOutput[]> {
    const response = await apiClient.request<{ data: UserOutput[] } | UserOutput[]>('/api/users')
    // Obsługa formatu { data: ... } lub bezpośredniej tablicy
    if (Array.isArray(response)) {
      return response
    }
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserOutput[] }).data
    }
    return []
  }

  async function createUser(data: CreateUserInput): Promise<UserOutput> {
    const response = await apiClient.request<{ data: UserOutput } | UserOutput>('/api/users', {
      method: 'POST',
      body: data
    })
    // Obsługa formatu { data: ... } lub bezpośredniego obiektu
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserOutput }).data
    }
    return response as UserOutput
  }

  return {
    getUsers,
    createUser
  }
}
