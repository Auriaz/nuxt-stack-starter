import type { ChatSocketEnvelope } from '#shared/types/chat'

export interface ChatPeer {
  send: (data: string) => void
  publish: (topic: string, data: string) => void
}

const peersByUserId = new Map<number, Set<ChatPeer>>()

export function registerChatPeer(userId: number, peer: ChatPeer) {
  const set = peersByUserId.get(userId) ?? new Set<ChatPeer>()
  set.add(peer)
  peersByUserId.set(userId, set)
}

export function unregisterChatPeer(userId: number, peer: ChatPeer) {
  const set = peersByUserId.get(userId)
  if (!set) return
  set.delete(peer)
  if (set.size === 0) {
    peersByUserId.delete(userId)
  }
}

export function publishChatEventToUser(userId: number, event: ChatSocketEnvelope) {
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

export function publishChatEventToThread(threadId: number, event: ChatSocketEnvelope) {
  const payload = JSON.stringify(event)
  // Publish to thread topic - all peers subscribed to this thread will receive it
  for (const set of peersByUserId.values()) {
    for (const peer of set) {
      try {
        peer.publish(`thread:${threadId}`, payload)
      } catch {
        set.delete(peer)
      }
    }
  }
}
