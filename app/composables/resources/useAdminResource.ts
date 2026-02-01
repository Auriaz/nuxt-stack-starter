import type { UserDTO, RoleDTO, PermissionDTO, UserStatus } from '#shared/types/auth'

import type { PermissionKey } from '#shared/permissions'
import { useApiClient } from './useApiClient'

export interface AdminUsersMeta {
  total: number
  page: number
  limit: number
}

export interface AdminOverviewResult {
  usersCount: number
  rolesCount: number
}

export function useAdminResource() {
  const apiClient = useApiClient()

  async function getUser(id: number): Promise<UserDTO> {
    const response = await apiClient.request<{ data: UserDTO } | UserDTO>(`/api/admin/users/${id}`)
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserDTO }).data
    }
    return response as UserDTO
  }

  async function getUsers(params?: { page?: number, limit?: number, q?: string }): Promise<{ data: UserDTO[], meta: AdminUsersMeta }> {
    const searchParams = new URLSearchParams()
    if (params?.page != null) searchParams.set('page', String(params.page))
    if (params?.limit != null) searchParams.set('limit', String(params.limit))
    if (params?.q != null && params.q !== '') searchParams.set('q', params.q)
    const query = searchParams.toString()
    const url = query ? `/api/admin/users?${query}` : '/api/admin/users'
    const response = await apiClient.request<{ data: UserDTO[], meta: AdminUsersMeta }>(url, { unwrap: false })
    if (response && typeof response === 'object' && 'data' in response && 'meta' in response) {
      return response as { data: UserDTO[], meta: AdminUsersMeta }
    }
    return { data: [], meta: { total: 0, page: 1, limit: 20 } }
  }

  async function updateUserStatus(userId: number, status: UserStatus): Promise<UserDTO> {
    const response = await apiClient.request<{ data: UserDTO } | UserDTO>(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: { status }
    })
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserDTO }).data
    }
    return response as UserDTO
  }

  async function getOverview(): Promise<AdminOverviewResult> {
    const response = await apiClient.request<{ data: AdminOverviewResult } | AdminOverviewResult>('/api/admin/overview')
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: AdminOverviewResult }).data
    }
    return response as AdminOverviewResult
  }

  async function updateUserRole(userId: number, roleId: number): Promise<UserDTO> {
    const response = await apiClient.request<{ data: UserDTO } | UserDTO>(`/api/admin/users/${userId}/roles`, {
      method: 'PATCH',
      body: { roleId }
    })
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserDTO }).data
    }
    return response as UserDTO
  }

  async function getRoles(): Promise<RoleDTO[]> {
    const response = await apiClient.request<{ data: RoleDTO[] } | RoleDTO[]>('/api/admin/roles')
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: RoleDTO[] }).data
    }
    return response as RoleDTO[]
  }

  async function createRole(input: { name: string, description?: string | null }): Promise<RoleDTO> {
    const response = await apiClient.request<{ data: RoleDTO } | RoleDTO>('/api/admin/roles', {
      method: 'POST',
      body: input
    })
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: RoleDTO }).data
    }
    return response as RoleDTO
  }

  async function updateRole(roleId: number, input: { name?: string, description?: string | null }): Promise<RoleDTO> {
    const response = await apiClient.request<{ data: RoleDTO } | RoleDTO>(`/api/admin/roles/${roleId}`, {
      method: 'PATCH',
      body: input
    })
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: RoleDTO }).data
    }
    return response as RoleDTO
  }

  async function updateRolePermissions(roleId: number, permissionKeys: PermissionKey[]): Promise<RoleDTO> {
    const response = await apiClient.request<{ data: RoleDTO } | RoleDTO>(
      `/api/admin/roles/${roleId}/permissions`,
      {
        method: 'PATCH',
        body: { permissionKeys }
      }
    )
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: RoleDTO }).data
    }
    return response as RoleDTO
  }

  async function getPermissions(): Promise<PermissionDTO[]> {
    const response = await apiClient.request<{ data: PermissionDTO[] } | PermissionDTO[]>('/api/admin/permissions')
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: PermissionDTO[] }).data
    }
    return response as PermissionDTO[]
  }

  return {
    getUser,
    getUsers,
    updateUserStatus,
    getOverview,
    updateUserRole,
    getRoles,
    createRole,
    updateRole,
    updateRolePermissions,
    getPermissions
  }
}
