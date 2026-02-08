import type { NotificationSocketEnvelope } from '#shared/types/notification'

export interface NotificationPeer {
  send: (data: string) => void
}

const peersByUserId = new Map<number, Set<NotificationPeer>>()

export function registerNotificationPeer(userId: number, peer: NotificationPeer) {
  const set = peersByUserId.get(userId) ?? new Set<NotificationPeer>()
  set.add(peer)
  peersByUserId.set(userId, set)
}

export function unregisterNotificationPeer(userId: number, peer: NotificationPeer) {
  const set = peersByUserId.get(userId)
  if (!set) return
  set.delete(peer)
  if (set.size === 0) {
    peersByUserId.delete(userId)
  }
}

export function publishNotificationEvent(userId: number, event: NotificationSocketEnvelope) {
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
