import type {
  CalendarEventDTO,
  CalendarEventListDTO,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventStatusUpdateInput,
  InviteParticipantsInput,
  CalendarEventRsvpInput
} from '#shared/types/calendar'
import { useApiClient } from './useApiClient'

export interface CalendarRangeParams {
  from: string
  to: string
  scope: 'personal' | 'team' | 'all'
  teamId?: number | null
}

export function useCalendarResource() {
  const apiClient = useApiClient()

  const listEvents = async (params: CalendarRangeParams): Promise<CalendarEventListDTO> => {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      scope: params.scope
    })

    if (typeof params.teamId === 'number') {
      query.set('team_id', String(params.teamId))
    }

    return await apiClient.request<CalendarEventListDTO>(`/api/calendar/events?${query.toString()}`)
  }

  const getEvent = async (eventId: number): Promise<CalendarEventDTO> => {
    return await apiClient.request<CalendarEventDTO>(`/api/calendar/events/${eventId}`)
  }

  const createEvent = async (input: CreateCalendarEventInput): Promise<CalendarEventDTO> => {
    return await apiClient.request<CalendarEventDTO>('/api/calendar/events', {
      method: 'POST',
      body: input
    })
  }

  const updateEvent = async (eventId: number, input: UpdateCalendarEventInput): Promise<CalendarEventDTO> => {
    return await apiClient.request<CalendarEventDTO>(`/api/calendar/events/${eventId}`, {
      method: 'PATCH',
      body: input
    })
  }

  const updateStatus = async (eventId: number, input: CalendarEventStatusUpdateInput): Promise<CalendarEventDTO> => {
    return await apiClient.request<CalendarEventDTO>(`/api/calendar/events/${eventId}/status`, {
      method: 'PATCH',
      body: input
    })
  }

  const inviteParticipants = async (eventId: number, input: InviteParticipantsInput): Promise<CalendarEventDTO> => {
    return await apiClient.request<CalendarEventDTO>(`/api/calendar/events/${eventId}/invite`, {
      method: 'POST',
      body: input
    })
  }

  const updateRsvp = async (eventId: number, input: CalendarEventRsvpInput): Promise<CalendarEventDTO> => {
    return await apiClient.request<CalendarEventDTO>(`/api/calendar/events/${eventId}/rsvp`, {
      method: 'PATCH',
      body: input
    })
  }

  return {
    listEvents,
    getEvent,
    createEvent,
    updateEvent,
    updateStatus,
    inviteParticipants,
    updateRsvp
  }
}
