import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { FriendRequestSendInputSchema } from '#shared/schemas/friends'
import { sendFriendRequestUseCase } from '~~/domain/friends/sendFriendRequest.usecase'
import { FriendBlockedError, FriendRequestConflictError, FriendSelfInviteError } from '~~/domain/friends/errors'
import { ensureDmThreadUseCase } from '~~/domain/chat/ensureDmThread.usecase'
import { friendsRepository } from '~~/server/repositories/friends.repo'
import { chatRepository } from '~~/server/repositories/chat.repo'
import { createNotification } from '~~/server/utils/notifications'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] } | undefined
  const userId = user?.id
  if (!userId) {
    throw createError({ status: 401, statusText: 'Unauthorized', data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } } })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.FRIENDS_INVITE)) {
    throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } } })
  }

  const body = await readBody(event)
  const parsed = safeParse(FriendRequestSendInputSchema, body)
  if (!parsed.success) {
    throw createError({
      status: 422,
      statusText: 'Validation error',
      data: { error: { code: 'VALIDATION_ERROR', message: 'Input validation failed', issues: parsed.issues } }
    })
  }

  try {
    const result = await sendFriendRequestUseCase(
      userId,
      parsed.output.receiver_id,
      parsed.output.message ?? null,
      friendsRepository
    )

    if (result.autoAccepted && permissions.includes(PERMISSIONS.CHAT_USE) && permissions.includes(PERMISSIONS.CHAT_DM_CREATE)) {
      const otherId = parsed.output.receiver_id
      await ensureDmThreadUseCase(userId, otherId, chatRepository)
    }

    if (result.autoAccepted) {
      const receiverName = result.request.receiver?.name || result.request.receiver?.username || 'Uzytkownik'
      await createNotification({
        userId: result.request.senderId,
        type: 'success',
        title: 'Zaproszenie zaakceptowane',
        message: `${receiverName} zaakceptowal(a) Twoje zaproszenie do znajomych.`,
        actionUrl: '/dashboard/friends'
      })
    } else {
      const senderName = result.request.sender?.name || result.request.sender?.username || 'Uzytkownik'
      await createNotification({
        userId: result.request.receiverId,
        type: 'info',
        title: 'Nowe zaproszenie do znajomych',
        message: `${senderName} wyslal(a) Ci zaproszenie do znajomych.`,
        actionUrl: '/dashboard/friends'
      })
    }

    return { data: { request_id: result.request.id, status: result.request.status, auto_accepted: result.autoAccepted } }
  } catch (err) {
    if (err instanceof FriendSelfInviteError) {
      throw createError({ status: 422, statusText: 'Invalid request', data: { error: { code: 'SELF_INVITE', message: err.message } } })
    }
    if (err instanceof FriendBlockedError) {
      throw createError({ status: 403, statusText: 'Forbidden', data: { error: { code: 'BLOCKED', message: err.message } } })
    }
    if (err instanceof FriendRequestConflictError) {
      throw createError({ status: 409, statusText: 'Conflict', data: { error: { code: err.reason, message: err.message } } })
    }
    throw err
  }
})
