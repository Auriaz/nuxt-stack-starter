import type { InferOutput } from 'valibot'
import type {
  CalendarEventStatusSchema,
  CalendarEventVisibilitySchema,
  CalendarEventParticipantRoleSchema,
  CalendarEventRsvpStatusSchema,
  CalendarEventReminderChannelSchema,
  CalendarEventParticipantSchema,
  CalendarEventReminderSchema,
  CalendarEventSchema,
  CalendarEventListItemSchema,
  CalendarEventListSchema,
  CalendarRangeQuerySchema,
  CreateCalendarEventInputSchema,
  UpdateCalendarEventInputSchema,
  CalendarEventStatusUpdateInputSchema,
  InviteParticipantsInputSchema,
  CalendarEventRsvpInputSchema,
  CalendarSocketEnvelopeSchema
} from '../schemas/calendar'

export type CalendarEventStatus = InferOutput<typeof CalendarEventStatusSchema>
export type CalendarEventVisibility = InferOutput<typeof CalendarEventVisibilitySchema>
export type CalendarEventParticipantRole = InferOutput<typeof CalendarEventParticipantRoleSchema>
export type CalendarEventRsvpStatus = InferOutput<typeof CalendarEventRsvpStatusSchema>
export type CalendarEventReminderChannel = InferOutput<typeof CalendarEventReminderChannelSchema>

export type CalendarEventParticipantDTO = InferOutput<typeof CalendarEventParticipantSchema>
export type CalendarEventReminderDTO = InferOutput<typeof CalendarEventReminderSchema>
export type CalendarEventDTO = InferOutput<typeof CalendarEventSchema>
export type CalendarEventListItemDTO = InferOutput<typeof CalendarEventListItemSchema>
export type CalendarEventListDTO = InferOutput<typeof CalendarEventListSchema>

export type CalendarRangeQuery = InferOutput<typeof CalendarRangeQuerySchema>
export type CreateCalendarEventInput = InferOutput<typeof CreateCalendarEventInputSchema>
export type UpdateCalendarEventInput = InferOutput<typeof UpdateCalendarEventInputSchema>
export type CalendarEventStatusUpdateInput = InferOutput<typeof CalendarEventStatusUpdateInputSchema>
export type InviteParticipantsInput = InferOutput<typeof InviteParticipantsInputSchema>
export type CalendarEventRsvpInput = InferOutput<typeof CalendarEventRsvpInputSchema>
export type CalendarSocketEnvelope = InferOutput<typeof CalendarSocketEnvelopeSchema>
export type CalendarSocketType = CalendarSocketEnvelope['type']
