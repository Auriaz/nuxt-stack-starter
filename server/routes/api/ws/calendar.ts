import type { H3Event } from 'h3'
import { registerCalendarPeer, unregisterCalendarPeer } from '~~/server/utils/calendarHub'

function getPeerContext(eventLike: { context?: Record<string, unknown> } | undefined) {
  return (eventLike?.context ?? {}) as Record<string, unknown>
}

function extractEvent(request: { context?: Record<string, unknown>, event?: H3Event } | H3Event | undefined) {
  if (!request) return undefined

  const directEvent = (request as { event?: H3Event }).event
  if (directEvent?.node?.req) {
    return directEvent
  }

  const maybeEvent = request as H3Event
  if (maybeEvent?.node?.req) {
    return maybeEvent
  }

  const ctx = getPeerContext(request)
  return (ctx.event as H3Event | undefined) ?? undefined
}

function toHeaders(input: Record<string, string | string[] | undefined> | undefined) {
  const headers = new Headers()
  if (!input) return headers
  for (const [key, value] of Object.entries(input)) {
    if (!value) continue
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '))
    } else {
      headers.set(key, value)
    }
  }
  return headers
}

export default defineWebSocketHandler({
  async upgrade(request) {
    const event = extractEvent(request)

    const nodeHeaders = (request as { _req?: { headers?: Record<string, string | string[] | undefined> } })?._req?.headers
    const fallbackHeaders = (request as { _headers?: Record<string, string> })?._headers
    let session: { user?: { id?: number, permissions?: string[] } } | null = null
    try {
      session = event
        ? await getUserSession(event)
        : await getUserSession({
            request: { headers: toHeaders(nodeHeaders || fallbackHeaders) },
            context: (request as { context?: Record<string, unknown> })?.context || {}
          })
    } catch {
      session = null
    }

    const user = session?.user as { id?: number, permissions?: string[] } | undefined
    const userId = user?.id
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const ctx = (request as { context?: Record<string, unknown> }).context
    if (ctx) {
      ctx.userId = userId
      ctx.permissions = user?.permissions ?? []
    }
  },

  open(peer) {
    const userId = Number(peer.context.userId)
    if (!userId) {
      peer.close(1008, 'Unauthorized')
      return
    }

    registerCalendarPeer(userId, peer)
  },

  close(peer) {
    const userId = Number(peer.context.userId)
    if (userId) {
      unregisterCalendarPeer(userId, peer)
    }
  }
})
