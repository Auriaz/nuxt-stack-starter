import {
  object,
  string,
  number,
  optional,
  array,
  picklist,
  pipe,
  minLength,
  maxLength,
  unknown
} from 'valibot'

export const CalendarEventStatusSchema = picklist(['scheduled', 'cancelled'] as const)
export const CalendarEventVisibilitySchema = picklist(['private', 'team'] as const)
export const CalendarEventParticipantRoleSchema = picklist(['owner', 'attendee'] as const)
export const CalendarEventRsvpStatusSchema = picklist(['invited', 'accepted', 'declined'] as const)
export const CalendarEventReminderChannelSchema = picklist(['in_app'] as const)

export const CalendarEventParticipantSchema = object({
  id: number(),
  event_id: number(),
  user_id: number(),
  role: CalendarEventParticipantRoleSchema,
  rsvp_status: CalendarEventRsvpStatusSchema,
  invited_by_id: optional(number()),
  created_at: string()
})

export const CalendarEventReminderSchema = object({
  id: number(),
  event_id: number(),
  minutes_before: number(),
  channel: CalendarEventReminderChannelSchema,
  fired_at: optional(string())
})

export const CalendarEventSchema = object({
  id: number(),
  owner_id: number(),
  team_id: optional(number()),
  category_id: optional(number()),
  title: string(),
  description: optional(string()),
  start_at: string(),
  end_at: string(),
  timezone: string(),
  location: optional(string()),
  url: optional(string()),
  status: CalendarEventStatusSchema,
  visibility: CalendarEventVisibilitySchema,
  cancelled_at: optional(string()),
  chat_thread_id: optional(number()),
  participants: optional(array(CalendarEventParticipantSchema)),
  reminders: optional(array(CalendarEventReminderSchema)),
  created_at: string(),
  updated_at: string()
})

export const CalendarEventListItemSchema = object({
  id: number(),
  owner_id: number(),
  team_id: optional(number()),
  category_id: optional(number()),
  title: string(),
  description: optional(string()),
  location: optional(string()),
  start_at: string(),
  end_at: string(),
  status: CalendarEventStatusSchema
})

export const CalendarEventListSchema = object({
  items: array(CalendarEventListItemSchema)
})

export const CalendarRangeQuerySchema = object({
  from: string(),
  to: string(),
  scope: picklist(['personal', 'team', 'all'] as const),
  team_id: optional(string())
})

export const CreateCalendarEventInputSchema = object({
  title: pipe(string(), minLength(1, 'Tytul jest wymagany'), maxLength(200, 'Tytul jest zbyt dlugi')),
  description: optional(pipe(string(), maxLength(2000, 'Opis jest zbyt dlugi'))),
  start_at: string(),
  end_at: string(),
  timezone: pipe(string(), minLength(1, 'Strefa czasowa jest wymagana'), maxLength(64, 'Strefa czasowa jest zbyt dluga')),
  team_id: optional(number()),
  category_id: optional(number()),
  visibility: optional(CalendarEventVisibilitySchema),
  location: optional(pipe(string(), maxLength(255, 'Lokalizacja jest zbyt dluga'))),
  url: optional(pipe(string(), maxLength(2048, 'URL jest zbyt dlugi'))),
  reminder_minutes: optional(number()),
  participant_ids: optional(array(number()))
})

export const UpdateCalendarEventInputSchema = object({
  title: optional(pipe(string(), minLength(1, 'Tytul jest wymagany'), maxLength(200, 'Tytul jest zbyt dlugi'))),
  description: optional(pipe(string(), maxLength(2000, 'Opis jest zbyt dlugi'))),
  start_at: optional(string()),
  end_at: optional(string()),
  timezone: optional(pipe(string(), minLength(1, 'Strefa czasowa jest wymagana'), maxLength(64, 'Strefa czasowa jest zbyt dluga'))),
  team_id: optional(number()),
  category_id: optional(number()),
  visibility: optional(CalendarEventVisibilitySchema),
  location: optional(pipe(string(), maxLength(255, 'Lokalizacja jest zbyt dluga'))),
  url: optional(pipe(string(), maxLength(2048, 'URL jest zbyt dlugi'))),
  reminder_minutes: optional(number()),
  participant_ids: optional(array(number()))
})

export const CalendarEventStatusUpdateInputSchema = object({
  status: CalendarEventStatusSchema
})

export const InviteParticipantsInputSchema = object({
  user_ids: array(number()),
  message: optional(pipe(string(), maxLength(500, 'Wiadomosc jest zbyt dluga')))
})

export const CalendarEventRsvpInputSchema = object({
  status: CalendarEventRsvpStatusSchema
})

export const CalendarSocketEnvelopeSchema = object({
  type: picklist([
    'calendar.event.created',
    'calendar.event.updated',
    'calendar.event.cancelled',
    'calendar.event.invited',
    'calendar.event.rsvp.updated'
  ] as const),
  payload: optional(unknown())
})
