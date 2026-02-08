import type { CreateTeamInput, UpdateTeamInput, TeamsListDTO, TeamDTO, TeamMembersDTO, TeamInvitesDTO, TeamMemberRoleInput, TeamInviteInput } from '#shared/types/teams'
import { useApiClient } from './useApiClient'

export function useTeamsResource() {
  const apiClient = useApiClient()

  const listTeams = async (): Promise<TeamsListDTO> => {
    return await apiClient.request('/api/teams')
  }

  const createTeam = async (input: CreateTeamInput): Promise<TeamDTO> => {
    return await apiClient.request('/api/teams', { method: 'POST', body: input })
  }

  const getTeam = async (teamId: number): Promise<TeamDTO> => {
    return await apiClient.request(`/api/teams/${teamId}`)
  }

  const updateTeam = async (teamId: number, input: UpdateTeamInput): Promise<TeamDTO> => {
    return await apiClient.request(`/api/teams/${teamId}`, { method: 'PATCH', body: input })
  }

  const deleteTeam = async (teamId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}`, { method: 'DELETE' })
  }

  const listMembers = async (teamId: number): Promise<TeamMembersDTO> => {
    return await apiClient.request(`/api/teams/${teamId}/members`)
  }

  const changeMemberRole = async (teamId: number, userId: number, input: TeamMemberRoleInput): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/members/${userId}`, { method: 'PATCH', body: input })
  }

  const removeMember = async (teamId: number, userId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' })
  }

  const listInvites = async (teamId: number): Promise<TeamInvitesDTO> => {
    return await apiClient.request(`/api/teams/${teamId}/invites`)
  }

  const listMyInvites = async (): Promise<TeamInvitesDTO> => {
    return await apiClient.request('/api/teams/invites')
  }

  const deleteInvite = async (teamId: number, inviteId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/invites/${inviteId}`, { method: 'DELETE' })
  }

  const deleteMyInvite = async (inviteId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/invites/${inviteId}`, { method: 'DELETE' })
  }

  const inviteUser = async (teamId: number, input: TeamInviteInput): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/invites`, { method: 'POST', body: input })
  }

  const acceptInvite = async (teamId: number, inviteId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/invites/${inviteId}/accept`, { method: 'POST' })
  }

  const declineInvite = async (teamId: number, inviteId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/invites/${inviteId}/decline`, { method: 'POST' })
  }

  const cancelInvite = async (teamId: number, inviteId: number): Promise<unknown> => {
    return await apiClient.request(`/api/teams/${teamId}/invites/${inviteId}/cancel`, { method: 'POST' })
  }

  return {
    listTeams,
    createTeam,
    getTeam,
    updateTeam,
    deleteTeam,
    listMembers,
    changeMemberRole,
    removeMember,
    listInvites,
    listMyInvites,
    deleteInvite,
    deleteMyInvite,
    inviteUser,
    acceptInvite,
    declineInvite,
    cancelInvite
  }
}
