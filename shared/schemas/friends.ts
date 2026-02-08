import { object, string, number, optional, picklist, array } from 'valibot'

export const FriendRequestStatusSchema = picklist([
  'pending',
  'accepted',
  'declined',
  'canceled',
  'blocked'
])

export const FriendUserSummarySchema = object({
  id: number(),
  username: string(),
  name: optional(string()),
  email: optional(string()),
  avatar_url: optional(string())
})

export const FriendRequestSchema = object({
  id: number(),
  sender_id: number(),
  receiver_id: number(),
  status: FriendRequestStatusSchema,
  message: optional(string()),
  created_at: string(),
  updated_at: string(),
  sender: optional(FriendUserSummarySchema),
  receiver: optional(FriendUserSummarySchema)
})

export const FriendsListSchema = object({
  friends: array(FriendUserSummarySchema),
  incoming: array(FriendRequestSchema),
  outgoing: array(FriendRequestSchema),
  blocked: array(FriendRequestSchema)
})

export const FriendRequestSendInputSchema = object({
  receiver_id: number(),
  message: optional(string())
})
