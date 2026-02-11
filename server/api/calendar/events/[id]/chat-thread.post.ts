import { getRouterParam } from 'h3'
import { PERMISSIONS } from '#shared/permissions'
import { calendarRepository } from '~~/server/repositories/calendar.repo'
import { chatRepository } from '~~/server/repositories/chat.repo'
import { teamsRepository } from '~~/server/repositories/teams.repo'
import { assertCanAccessEventUseCase } from '~~/domain/calendar/assertCanAccessEvent.usecase'

function parseId(value: unknown): number | null {
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const user = session.user as { id?: number, permissions?: string[] }
  const userId = user?.id
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      data: { error: { code: 'UNAUTHORIZED', message: 'Missing user id' } }
    })
  }

  const permissions = user.permissions ?? []
  if (!permissions.includes(PERMISSIONS.CHAT_USE)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Chat access denied' } }
    })
  }

  const eventId = parseId(getRouterParam(event, 'id'))
  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid event id',
      data: { error: { code: 'BAD_REQUEST', message: 'Invalid event id' } }
    })
  }

  // Pobierz wydarzenie
  const calendarEvent = await calendarRepository.findEventById(eventId)
  if (!calendarEvent) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Event not found',
      data: { error: { code: 'NOT_FOUND', message: 'Calendar event not found' } }
    })
  }

  // Sprawdź uprawnienia do dostępu do wydarzenia
  try {
    await assertCanAccessEventUseCase(
      { userId, permissions, event: calendarEvent, action: 'read' },
      { teamsRepository }
    )
  } catch {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
      data: { error: { code: 'FORBIDDEN', message: 'Cannot access this event' } }
    })
  }

  // Jeśli wydarzenie już ma wątek czatu, zwróć jego ID
  if (calendarEvent.chatThreadId) {
    return { thread_id: calendarEvent.chatThreadId }
  }

  // Utwórz nowy wątek czatu
  const threadTitle = `Czat: ${calendarEvent.title}`
  const thread = await chatRepository.createThread({
    type: calendarEvent.teamId ? 'team' : 'room',
    title: threadTitle,
    createdById: userId,
    teamId: calendarEvent.teamId ?? null
  })

  // Dodaj twórcę jako uczestnika
  await chatRepository.createParticipant({
    threadId: thread.id,
    userId,
    role: 'owner'
  })

  // Dodaj uczestników wydarzenia do wątku czatu
  const participants = await calendarRepository.listParticipants(eventId)
  for (const participant of participants) {
    if (participant.userId !== userId) {
      await chatRepository.createParticipant({
        threadId: thread.id,
        userId: participant.userId,
        role: 'member'
      })
    }
  }

  // Zaktualizuj wydarzenie z ID wątku czatu
  await calendarRepository.updateEvent(eventId, {
    chatThreadId: thread.id
  })

  return { thread_id: thread.id }
})
