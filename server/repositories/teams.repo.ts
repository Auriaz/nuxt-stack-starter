import { prisma } from '../services/prisma'

export interface TeamRecord {
  id: number
  name: string
  slug: string | null
  ownerId: number
  createdAt: Date
  updatedAt: Date
}

export interface TeamMemberRecord {
  id: number
  teamId: number
  userId: number
  role: string
  joinedAt: Date
  user?: {
    id: number
    username: string
    email: string
    name: string | null
    avatarUrl: string | null
  }
}

export interface TeamInviteRecord {
  id: number
  teamId: number
  inviterId: number
  inviteeId: number
  status: string
  createdAt: Date
  updatedAt: Date
  respondedAt: Date | null
  team?: {
    id: number
    name: string
    slug: string | null
  }
  inviter?: {
    id: number
    username: string
    email: string
    name: string | null
    avatarUrl: string | null
  }
  invitee?: {
    id: number
    username: string
    email: string
    name: string | null
    avatarUrl: string | null
  }
}

export interface TeamsRepository {
  createTeam(input: { name: string, slug?: string | null, ownerId: number }): Promise<TeamRecord>
  findTeamById(teamId: number): Promise<TeamRecord | null>
  updateTeam(teamId: number, data: { name?: string | null }): Promise<TeamRecord>
  deleteTeam(teamId: number): Promise<void>
  listTeamsForUser(userId: number): Promise<TeamRecord[]>
  findMember(teamId: number, userId: number): Promise<TeamMemberRecord | null>
  listMembers(teamId: number): Promise<TeamMemberRecord[]>
  createMember(input: { teamId: number, userId: number, role?: string }): Promise<TeamMemberRecord>
  updateMemberRole(teamId: number, userId: number, role: string): Promise<TeamMemberRecord>
  removeMember(teamId: number, userId: number): Promise<void>
  listInvites(teamId: number): Promise<TeamInviteRecord[]>
  listInvitesForUser(userId: number): Promise<TeamInviteRecord[]>
  findInviteById(inviteId: number): Promise<TeamInviteRecord | null>
  findInviteByTeamInviteeStatus(teamId: number, inviteeId: number, status: string): Promise<TeamInviteRecord | null>
  findPendingInvite(teamId: number, inviteeId: number): Promise<TeamInviteRecord | null>
  createInvite(input: { teamId: number, inviterId: number, inviteeId: number }): Promise<TeamInviteRecord>
  updateInviteStatus(inviteId: number, status: string, respondedAt?: Date | null): Promise<TeamInviteRecord>
  deleteInvite(inviteId: number): Promise<void>
}

const selectUser = {
  id: true,
  username: true,
  email: true,
  name: true,
  avatarUrl: true
}

const selectTeam = {
  id: true,
  name: true,
  slug: true
}

export const teamsRepository: TeamsRepository = {
  async createTeam(input) {
    return await prisma.team.create({
      data: {
        name: input.name,
        slug: input.slug ?? undefined,
        ownerId: input.ownerId
      }
    }) as TeamRecord
  },

  async findTeamById(teamId) {
    return await prisma.team.findUnique({
      where: { id: teamId }
    }) as TeamRecord | null
  },

  async updateTeam(teamId, data) {
    return await prisma.team.update({
      where: { id: teamId },
      data: {
        name: data.name ?? undefined
      }
    }) as TeamRecord
  },

  async deleteTeam(teamId) {
    await prisma.team.delete({
      where: { id: teamId }
    })
  },

  async listTeamsForUser(userId) {
    return await prisma.team.findMany({
      where: {
        members: { some: { userId } }
      },
      orderBy: { updatedAt: 'desc' }
    }) as TeamRecord[]
  },

  async findMember(teamId, userId) {
    return await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
      include: { user: { select: selectUser } }
    }) as TeamMemberRecord | null
  },

  async listMembers(teamId) {
    return await prisma.teamMember.findMany({
      where: { teamId },
      orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
      include: { user: { select: selectUser } }
    }) as TeamMemberRecord[]
  },

  async createMember(input) {
    return await prisma.teamMember.create({
      data: {
        teamId: input.teamId,
        userId: input.userId,
        role: input.role ?? 'member'
      },
      include: { user: { select: selectUser } }
    }) as TeamMemberRecord
  },

  async updateMemberRole(teamId, userId, role) {
    return await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId } },
      data: { role },
      include: { user: { select: selectUser } }
    }) as TeamMemberRecord
  },

  async removeMember(teamId, userId) {
    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId } }
    })
  },

  async listInvites(teamId) {
    return await prisma.teamInvite.findMany({
      where: { teamId },
      orderBy: { createdAt: 'desc' },
      include: {
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord[]
  },

  async listInvitesForUser(userId) {
    return await prisma.teamInvite.findMany({
      where: { inviteeId: userId, status: { in: ['pending', 'declined'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        team: { select: selectTeam },
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord[]
  },

  async findInviteById(inviteId) {
    return await prisma.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: { select: selectTeam },
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord | null
  },

  async findInviteByTeamInviteeStatus(teamId, inviteeId, status) {
    return await prisma.teamInvite.findFirst({
      where: { teamId, inviteeId, status },
      include: {
        team: { select: selectTeam },
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord | null
  },

  async findPendingInvite(teamId, inviteeId) {
    return await prisma.teamInvite.findFirst({
      where: { teamId, inviteeId, status: 'pending' },
      include: {
        team: { select: selectTeam },
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord | null
  },

  async createInvite(input) {
    return await prisma.teamInvite.create({
      data: {
        teamId: input.teamId,
        inviterId: input.inviterId,
        inviteeId: input.inviteeId,
        status: 'pending'
      },
      include: {
        team: { select: selectTeam },
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord
  },

  async updateInviteStatus(inviteId, status, respondedAt) {
    return await prisma.teamInvite.update({
      where: { id: inviteId },
      data: { status, respondedAt: respondedAt ?? undefined },
      include: {
        team: { select: selectTeam },
        inviter: { select: selectUser },
        invitee: { select: selectUser }
      }
    }) as TeamInviteRecord
  },

  async deleteInvite(inviteId) {
    await prisma.teamInvite.delete({
      where: { id: inviteId }
    })
  }
}
