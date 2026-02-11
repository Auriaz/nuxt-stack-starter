import type { CalendarEventDTO } from '#shared/types/calendar'
import type { CalendarRepository } from '~~/server/repositories/calendar.repo'
import type { ChatRepository } from '~~/server/repositories/chat.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { NotFoundError } from '../shared/errors'
import { assertCanAccessEventUseCase } from './assertCanAccessEvent.usecase'
import { toCalendarEventDTO } from './calendar.mapper'
import { notifyCalendarEventChange } from './calendar.notifications'

export async function cancelEventUseCase(
  params: { userId: number, permissions: string[], eventId: number },
  deps: { calendarRepository: CalendarRepository, teamsRepository: TeamsRepository, chatRepository?: ChatRepository }
): Promise<CalendarEventDTO> {
  const event = await deps.calendarRepository.findEventById(params.eventId)
  if (!event) {
    throw new NotFoundError('Calendar event not found')
  }

  await assertCanAccessEventUseCase(
    { userId: params.userId, permissions: params.permissions, event, action: 'write' },
    { teamsRepository: deps.teamsRepository }
  )

  // Jeśli wydarzenie ma powiązany wątek czatu, wyślij wiadomość systemową
  if (event.chatThreadId && deps.chatRepository) {
    try {
      const { publishChatEventToThread } = await import('~~/server/utils/chatHub')
      const { toChatMessageDTO } = await import('../chat/createMessage.usecase')

      const now = new Date()
      const messageRecord = await deps.chatRepository.createMessage({
        threadId: event.chatThreadId,
        senderId: null,
        type: 'system',
        content: `Wydarzenie "${event.title}" zostało anulowane.`,
        metadata: { eventId: event.id, action: 'event_cancelled' }
      })
      await deps.chatRepository.updateThreadLastMessageAt(event.chatThreadId, now)

      // Wyślij broadcast do uczestników wątku czatu
      const messageDto = toChatMessageDTO(messageRecord)
      publishChatEventToThread(event.chatThreadId, {
        type: 'chat.message.new',
        payload: {
          thread_id: event.chatThreadId,
          message: messageDto
        }
      })
    } catch {
      // Ignoruj błędy czatu - wydarzenie i tak zostanie anulowane
    }
  }

  const cancelled = await deps.calendarRepository.cancelEvent(event.id)
  const participants = await deps.calendarRepository.listParticipants(event.id)
  const reminders = await deps.calendarRepository.listReminders(event.id)
  await notifyCalendarEventChange({
    action: 'calendar.event.cancelled',
    event: cancelled,
    actorId: params.userId,
    participants,
    teamsRepository: deps.teamsRepository
  })
  return toCalendarEventDTO(cancelled, participants, reminders)
}
