import type { CalendarSocketType } from '#shared/types/calendar'
import type { CalendarEventRecord, CalendarEventParticipantRecord } from '~~/server/repositories/calendar.repo'
import type { TeamsRepository } from '~~/server/repositories/teams.repo'
import { createNotification } from '~~/server/utils/notifications'
import { publishCalendarEvent } from '~~/server/utils/calendarHub'

function buildMessage(action: CalendarSocketType, title: string) {
  switch (action) {
    case 'calendar.event.created':
      return `Wydarzenie "${title}" zostalo utworzone.`
    case 'calendar.event.updated':
      return `Wydarzenie "${title}" zostalo zaktualizowane.`
    case 'calendar.event.cancelled':
      return `Wydarzenie "${title}" zostalo anulowane.`
    case 'calendar.event.invited':
      return `Masz zaproszenie do wydarzenia "${title}".`
    case 'calendar.event.rsvp.updated':
      return `Zmieniono status RSVP dla wydarzenia "${title}".`
    default:
      return `Aktualizacja wydarzenia: "${title}".`
  }
}

async function resolveTeamMemberIds(teamId: number, teamsRepository: TeamsRepository): Promise<number[]> {
  const members = await teamsRepository.listMembers(teamId)
  return members.map(member => member.userId)
}

function uniqueRecipients(ids: number[], actorId: number) {
  const set = new Set<number>(ids)
  set.delete(actorId)
  return Array.from(set)
}

export async function notifyCalendarUsers(params: {
  action: CalendarSocketType
  event: CalendarEventRecord
  actorId: number
  participants?: CalendarEventParticipantRecord[]
  teamMemberIds?: number[]
  recipientIds?: number[]
  titleOverride?: string
  messageOverride?: string
}) {
  const title = params.titleOverride ?? params.event.title
  const message = params.messageOverride ?? buildMessage(params.action, title)
  const actionUrl = `/dashboard/calendar?event=${params.event.id}`

  const recipients = params.recipientIds
    ? params.recipientIds
    : uniqueRecipients([
        ...(params.participants ? params.participants.map(p => p.userId) : []),
        ...(params.teamMemberIds ?? [])
      ], params.actorId)

  if (recipients.length === 0) return

  await Promise.all(
    recipients.map(async (userId) => {
      await createNotification({
        userId,
        type: 'info',
        title: 'Calendar',
        message,
        actionUrl
      })
      publishCalendarEvent(userId, { type: params.action, payload: { event_id: params.event.id, actor_id: params.actorId } })
    })
  )
}

export async function notifyCalendarEventChange(params: {
  action: CalendarSocketType
  event: CalendarEventRecord
  actorId: number
  participants: CalendarEventParticipantRecord[]
  teamsRepository?: TeamsRepository
}) {
  let teamMemberIds: number[] = []

  // Dla wydarzeń zespołowych, powiadomienia dostają wszyscy członkowie zespołu
  if (params.event.teamId && params.teamsRepository) {
    try {
      teamMemberIds = await resolveTeamMemberIds(params.event.teamId, params.teamsRepository)
    } catch {
      // Błąd przy pobieraniu członków zespołu - kontynuuj z pustą listą
    }
  }

  await notifyCalendarUsers({
    action: params.action,
    event: params.event,
    actorId: params.actorId,
    participants: params.participants,
    teamMemberIds
  })

  // Always broadcast WebSocket event to event owner for real-time updates
  publishCalendarEvent(params.event.ownerId, {
    type: params.action,
    payload: { event_id: params.event.id, actor_id: params.actorId }
  })
}

export async function notifyCalendarOwner(params: { action: CalendarSocketType, event: CalendarEventRecord, actorId: number }) {
  if (params.event.ownerId === params.actorId) return
  await notifyCalendarUsers({
    action: params.action,
    event: params.event,
    actorId: params.actorId,
    recipientIds: [params.event.ownerId]
  })
}
