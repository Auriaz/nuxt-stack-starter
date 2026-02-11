import type { CalendarSocketEnvelope } from '#shared/types/calendar'

export interface CalendarPeer {
  send: (data: string) => void
}

const peersByUserId = new Map<number, Set<CalendarPeer>>()

export function registerCalendarPeer(userId: number, peer: CalendarPeer) {
  const set = peersByUserId.get(userId) ?? new Set<CalendarPeer>()
  set.add(peer)
  peersByUserId.set(userId, set)
}

export function unregisterCalendarPeer(userId: number, peer: CalendarPeer) {
  const set = peersByUserId.get(userId)
  if (!set) return
  set.delete(peer)
  if (set.size === 0) {
    peersByUserId.delete(userId)
  }
}

export function publishCalendarEvent(userId: number, event: CalendarSocketEnvelope) {
  const set = peersByUserId.get(userId)
  if (!set || set.size === 0) return
  const payload = JSON.stringify(event)
  for (const peer of set) {
    try {
      peer.send(payload)
    } catch {
      set.delete(peer)
    }
  }
  if (set.size === 0) {
    peersByUserId.delete(userId)
  }
}
