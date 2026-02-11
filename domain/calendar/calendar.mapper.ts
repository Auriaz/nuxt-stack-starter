import type {
  CalendarEventDTO,
  CalendarEventListItemDTO,
  CalendarEventParticipantDTO,
  CalendarEventReminderDTO
} from '#shared/types/calendar'
import type {
  CalendarEventRecord,
  CalendarEventParticipantRecord,
  CalendarEventReminderRecord
} from '~~/server/repositories/calendar.repo'

export function toCalendarEventParticipantDTO(record: CalendarEventParticipantRecord): CalendarEventParticipantDTO {
  return {
    id: record.id,
    event_id: record.eventId,
    user_id: record.userId,
    role: record.role as CalendarEventParticipantDTO['role'],
    rsvp_status: record.rsvpStatus as CalendarEventParticipantDTO['rsvp_status'],
    invited_by_id: record.invitedById ?? undefined,
    created_at: record.createdAt.toISOString()
  }
}

export function toCalendarEventReminderDTO(record: CalendarEventReminderRecord): CalendarEventReminderDTO {
  return {
    id: record.id,
    event_id: record.eventId,
    minutes_before: record.minutesBefore,
    channel: record.channel as CalendarEventReminderDTO['channel'],
    fired_at: record.firedAt ? record.firedAt.toISOString() : undefined
  }
}

export function toCalendarEventDTO(
  record: CalendarEventRecord,
  participants?: CalendarEventParticipantRecord[],
  reminders?: CalendarEventReminderRecord[]
): CalendarEventDTO {
  return {
    id: record.id,
    owner_id: record.ownerId,
    team_id: record.teamId ?? undefined,
    title: record.title,
    description: record.description ?? undefined,
    start_at: record.startAt.toISOString(),
    end_at: record.endAt.toISOString(),
    timezone: record.timezone,
    location: record.location ?? undefined,
    url: record.url ?? undefined,
    status: record.status as CalendarEventDTO['status'],
    visibility: record.visibility as CalendarEventDTO['visibility'],
    cancelled_at: record.cancelledAt ? record.cancelledAt.toISOString() : undefined,
    chat_thread_id: record.chatThreadId ?? undefined,
    participants: participants ? participants.map(toCalendarEventParticipantDTO) : undefined,
    reminders: reminders ? reminders.map(toCalendarEventReminderDTO) : undefined,
    created_at: record.createdAt.toISOString(),
    updated_at: record.updatedAt.toISOString()
  }
}

export function toCalendarEventListItemDTO(record: CalendarEventRecord): CalendarEventListItemDTO {
  return {
    id: record.id,
    owner_id: record.ownerId,
    team_id: record.teamId ?? undefined,
    title: record.title,
    start_at: record.startAt.toISOString(),
    end_at: record.endAt.toISOString(),
    status: record.status as CalendarEventListItemDTO['status']
  }
}
