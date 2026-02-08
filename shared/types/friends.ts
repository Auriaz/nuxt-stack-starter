import type { InferOutput } from 'valibot'
import type {
  FriendRequestStatusSchema,
  FriendUserSummarySchema,
  FriendRequestSchema,
  FriendsListSchema,
  FriendRequestSendInputSchema
} from '../schemas/friends'

export type FriendRequestStatus = InferOutput<typeof FriendRequestStatusSchema>
export type FriendUserSummaryDTO = InferOutput<typeof FriendUserSummarySchema>
export type FriendRequestDTO = InferOutput<typeof FriendRequestSchema>
export type FriendsListDTO = InferOutput<typeof FriendsListSchema>
export type FriendRequestSendInput = InferOutput<typeof FriendRequestSendInputSchema>
