import { prisma } from '../services/prisma'

export interface CalendarEventRecord {
  id: number
  ownerId: number
  teamId: number | null
  categoryId: number | null
  title: string
  description: string | null
  startAt: Date
  endAt: Date
  timezone: string
  location: string | null
  url: string | null
  status: string
  visibility: string
  cancelledAt: Date | null
  chatThreadId: number | null
  createdAt: Date
  updatedAt: Date
}

export interface CalendarEventParticipantRecord {
  id: number
  eventId: number
  userId: number
  role: string
  rsvpStatus: string
  invitedById: number | null
  createdAt: Date
}

export interface CalendarEventReminderRecord {
  id: number
  eventId: number
  minutesBefore: number
  channel: string
  firedAt: Date | null
}

export interface CalendarEventCreateInput {
  ownerId: number
  teamId?: number | null
  categoryId?: number | null
  title: string
  description?: string | null
  startAt: Date
  endAt: Date
  timezone: string
  location?: string | null
  url?: string | null
  visibility: string
  chatThreadId?: number | null
}

export interface CalendarEventUpdateInput {
  title?: string
  description?: string | null
  startAt?: Date
  endAt?: Date
  timezone?: string
  teamId?: number | null
  categoryId?: number | null
  visibility?: string
  location?: string | null
  url?: string | null
  chatThreadId?: number | null
}

export interface CalendarEventParticipantCreateInput {
  eventId: number
  userId: number
  role?: string
  rsvpStatus?: string
  invitedById?: number | null
}

export interface CalendarRepository {
  findEventById(eventId: number): Promise<CalendarEventRecord | null>
  listEventsForOwnerInRange(userId: number, from: Date, to: Date): Promise<CalendarEventRecord[]>
  listEventsForTeamInRange(teamId: number, from: Date, to: Date): Promise<CalendarEventRecord[]>
  listEventsForTeamsInRange(teamIds: number[], from: Date, to: Date): Promise<CalendarEventRecord[]>
  createEvent(input: CalendarEventCreateInput): Promise<CalendarEventRecord>
  updateEvent(eventId: number, data: CalendarEventUpdateInput): Promise<CalendarEventRecord>
  cancelEvent(eventId: number): Promise<CalendarEventRecord>
  listParticipants(eventId: number): Promise<CalendarEventParticipantRecord[]>
  addParticipants(participants: CalendarEventParticipantCreateInput[]): Promise<CalendarEventParticipantRecord[]>
  updateParticipantRsvp(eventId: number, userId: number, status: string): Promise<CalendarEventParticipantRecord>
  clearReminders(eventId: number): Promise<void>
  addReminder(eventId: number, minutesBefore: number, channel?: string): Promise<CalendarEventReminderRecord>
  listReminders(eventId: number): Promise<CalendarEventReminderRecord[]>
}

const getCalendarEventModel = () => {
  const client = prisma as unknown as {
    calendarEvent: {
      findUnique: (args: unknown) => Promise<CalendarEventRecord | null>
      findMany: (args: unknown) => Promise<CalendarEventRecord[]>
      create: (args: unknown) => Promise<CalendarEventRecord>
      update: (args: unknown) => Promise<CalendarEventRecord>
    }
  }
  return client.calendarEvent
}

const getCalendarEventParticipantModel = () => {
  const client = prisma as unknown as {
    calendarEventParticipant: {
      findMany: (args: unknown) => Promise<CalendarEventParticipantRecord[]>
      createMany: (args: unknown) => Promise<{ count: number }>
      update: (args: unknown) => Promise<CalendarEventParticipantRecord>
    }
  }
  return client.calendarEventParticipant
}

const getCalendarEventReminderModel = () => {
  const client = prisma as unknown as {
    calendarEventReminder: {
      findMany: (args: unknown) => Promise<CalendarEventReminderRecord[]>
      create: (args: unknown) => Promise<CalendarEventReminderRecord>
      deleteMany: (args: unknown) => Promise<{ count: number }>
    }
  }
  return client.calendarEventReminder
}

const rangeOverlapWhere = (from: Date, to: Date) => ({
  AND: [
    { startAt: { lte: to } },
    { endAt: { gte: from } }
  ]
})

export const calendarRepository: CalendarRepository = {
  async findEventById(eventId) {
    const model = getCalendarEventModel()
    return await model.findUnique({
      where: { id: eventId }
    })
  },

  async listEventsForOwnerInRange(userId, from, to) {
    const model = getCalendarEventModel()
    return await model.findMany({
      where: {
        ownerId: userId,
        teamId: null,
        ...rangeOverlapWhere(from, to)
      },
      orderBy: { startAt: 'asc' }
    })
  },

  async listEventsForTeamInRange(teamId, from, to) {
    const model = getCalendarEventModel()
    return await model.findMany({
      where: {
        teamId,
        ...rangeOverlapWhere(from, to)
      },
      orderBy: { startAt: 'asc' }
    })
  },

  async listEventsForTeamsInRange(teamIds, from, to) {
    const model = getCalendarEventModel()
    return await model.findMany({
      where: {
        teamId: { in: teamIds },
        ...rangeOverlapWhere(from, to)
      },
      orderBy: { startAt: 'asc' }
    })
  },

  async createEvent(input) {
    const model = getCalendarEventModel()
    return await model.create({
      data: {
        ownerId: input.ownerId,
        teamId: input.teamId ?? undefined,
        categoryId: typeof input.categoryId === 'number' ? input.categoryId : input.categoryId === null ? null : undefined,
        title: input.title,
        description: input.description ?? undefined,
        startAt: input.startAt,
        endAt: input.endAt,
        timezone: input.timezone,
        location: input.location ?? undefined,
        url: input.url ?? undefined,
        visibility: input.visibility,
        chatThreadId: input.chatThreadId ?? undefined
      }
    })
  },

  async updateEvent(eventId, data) {
    const model = getCalendarEventModel()
    return await model.update({
      where: { id: eventId },
      data: {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        startAt: data.startAt ?? undefined,
        endAt: data.endAt ?? undefined,
        timezone: data.timezone ?? undefined,
        teamId: typeof data.teamId === 'number' ? data.teamId : data.teamId === null ? null : undefined,
        categoryId: typeof data.categoryId === 'number' ? data.categoryId : data.categoryId === null ? null : undefined,
        visibility: data.visibility ?? undefined,
        location: data.location ?? undefined,
        url: data.url ?? undefined,
        chatThreadId: typeof data.chatThreadId === 'number' ? data.chatThreadId : data.chatThreadId === null ? null : undefined
      }
    })
  },

  async cancelEvent(eventId) {
    const model = getCalendarEventModel()
    return await model.update({
      where: { id: eventId },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        chatThreadId: null
      }
    })
  },

  async listParticipants(eventId) {
    const model = getCalendarEventParticipantModel()
    return await model.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' }
    })
  },

  async addParticipants(participants) {
    if (participants.length === 0) return []
    const model = getCalendarEventParticipantModel()
    await model.createMany({
      data: participants.map(participant => ({
        eventId: participant.eventId,
        userId: participant.userId,
        role: participant.role ?? 'attendee',
        rsvpStatus: participant.rsvpStatus ?? 'invited',
        invitedById: participant.invitedById ?? undefined
      })),
      skipDuplicates: true
    })
    return await model.findMany({
      where: { eventId: participants[0].eventId },
      orderBy: { createdAt: 'asc' }
    })
  },

  async updateParticipantRsvp(eventId, userId, status) {
    const model = getCalendarEventParticipantModel()
    return await model.update({
      where: { eventId_userId: { eventId, userId } },
      data: { rsvpStatus: status }
    })
  },

  async clearReminders(eventId) {
    const model = getCalendarEventReminderModel()
    await model.deleteMany({ where: { eventId } })
  },

  async addReminder(eventId, minutesBefore, channel = 'in_app') {
    const model = getCalendarEventReminderModel()
    return await model.create({
      data: {
        eventId,
        minutesBefore,
        channel
      }
    })
  },

  async listReminders(eventId) {
    const model = getCalendarEventReminderModel()
    return await model.findMany({
      where: { eventId },
      orderBy: { minutesBefore: 'asc' }
    })
  }
}
