import type { InferOutput } from 'valibot'
import type {
  TeamRoleSchema,
  TeamInviteStatusSchema,
  TeamSchema,
  TeamMemberSchema,
  TeamInviteSchema,
  TeamSummarySchema,
  TeamListSchema,
  TeamMembersSchema,
  TeamInvitesSchema,
  CreateTeamInputSchema,
  UpdateTeamInputSchema,
  TeamInviteInputSchema,
  TeamMemberRoleInputSchema
} from '../schemas/teams'

export type TeamRole = InferOutput<typeof TeamRoleSchema>
export type TeamInviteStatus = InferOutput<typeof TeamInviteStatusSchema>
export type TeamDTO = InferOutput<typeof TeamSchema>
export type TeamSummaryDTO = InferOutput<typeof TeamSummarySchema>
export type TeamMemberDTO = InferOutput<typeof TeamMemberSchema>
export type TeamInviteDTO = InferOutput<typeof TeamInviteSchema>
export type TeamsListDTO = InferOutput<typeof TeamListSchema>
export type TeamMembersDTO = InferOutput<typeof TeamMembersSchema>
export type TeamInvitesDTO = InferOutput<typeof TeamInvitesSchema>
export type CreateTeamInput = InferOutput<typeof CreateTeamInputSchema>
export type UpdateTeamInput = InferOutput<typeof UpdateTeamInputSchema>
export type TeamInviteInput = InferOutput<typeof TeamInviteInputSchema>
export type TeamMemberRoleInput = InferOutput<typeof TeamMemberRoleInputSchema>
