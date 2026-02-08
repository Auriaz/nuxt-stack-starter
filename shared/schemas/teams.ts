import { object, string, number, optional, picklist, array } from 'valibot'
import { FriendUserSummarySchema } from './friends'

export const TeamRoleSchema = picklist(['owner', 'admin', 'member'])

export const TeamInviteStatusSchema = picklist([
  'pending',
  'accepted',
  'declined',
  'canceled'
])

export const TeamSchema = object({
  id: number(),
  name: string(),
  slug: optional(string()),
  owner_id: number(),
  created_at: string(),
  updated_at: string()
})

export const TeamSummarySchema = object({
  id: number(),
  name: string(),
  slug: optional(string())
})

export const TeamMemberSchema = object({
  id: number(),
  team_id: number(),
  user_id: number(),
  role: TeamRoleSchema,
  joined_at: string(),
  user: optional(FriendUserSummarySchema)
})

export const TeamInviteSchema = object({
  id: number(),
  team_id: number(),
  inviter_id: number(),
  invitee_id: number(),
  status: TeamInviteStatusSchema,
  created_at: string(),
  updated_at: string(),
  responded_at: optional(string()),
  inviter: optional(FriendUserSummarySchema),
  invitee: optional(FriendUserSummarySchema),
  team: optional(TeamSummarySchema)
})

export const TeamListSchema = object({
  teams: array(TeamSchema)
})

export const TeamMembersSchema = object({
  members: array(TeamMemberSchema)
})

export const TeamInvitesSchema = object({
  invites: array(TeamInviteSchema)
})

export const CreateTeamInputSchema = object({
  name: string(),
  slug: optional(string())
})

export const UpdateTeamInputSchema = object({
  name: optional(string())
})

export const TeamInviteInputSchema = object({
  invitee_id: number()
})

export const TeamMemberRoleInputSchema = object({
  role: TeamRoleSchema
})
