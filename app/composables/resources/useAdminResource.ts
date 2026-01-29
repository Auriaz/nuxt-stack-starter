import type { UserDTO, RoleDTO, PermissionDTO } from '#shared/types/auth'
import type { PermissionKey } from '#shared/permissions'
import { useApiClient } from './useApiClient'

export function useAdminResource() {
  const apiClient = useApiClient()

  async function getUsers(): Promise<UserDTO[]> {
    const response = await apiClient.request<{ data: UserDTO[] } | UserDTO[]>('/api/admin/users')
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: UserDTO[] }).data
    }
    return response as UserDTO[]
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
    getUsers,
    updateUserRole,
    getRoles,
    createRole,
    updateRole,
    updateRolePermissions,
    getPermissions
  }
}
