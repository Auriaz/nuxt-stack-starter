import { ref, readonly } from 'vue'
import { safeParse } from 'valibot'
import { CalendarSocketEnvelopeSchema } from '#shared/schemas/calendar'
import type { CalendarSocketEnvelope } from '#shared/types/calendar'

const socketRef = ref<WebSocket | null>(null)
const statusRef = ref<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle')
const handlers = new Set<(event: CalendarSocketEnvelope) => void>()
let reconnectAttempts = 0
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let manualClose = false

function getWsUrl() {
  if (import.meta.server) return ''
  const { protocol, host } = window.location
  const wsProtocol = protocol === 'https:' ? 'wss' : 'ws'
  return `${wsProtocol}://${host}/api/ws/calendar`
}

function clearReconnectTimer() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

function scheduleReconnect() {
  clearReconnectTimer()
  reconnectAttempts += 1
  const delay = Math.min(1000 * 2 ** Math.min(reconnectAttempts, 5), 15000)
  reconnectTimer = setTimeout(() => {
    connect()
  }, delay)
}

function connect() {
  if (import.meta.server) return
  if (socketRef.value && (socketRef.value.readyState === WebSocket.OPEN || socketRef.value.readyState === WebSocket.CONNECTING)) {
    return
  }

  const url = getWsUrl()
  if (!url) return

  statusRef.value = 'connecting'
  manualClose = false
  socketRef.value = new WebSocket(url)

  socketRef.value.onopen = () => {
    statusRef.value = 'open'
    reconnectAttempts = 0
  }

  socketRef.value.onmessage = (event) => {
    let payload: unknown
    try {
      payload = JSON.parse(event.data)
    } catch {
      return
    }

    const parsed = safeParse(CalendarSocketEnvelopeSchema, payload)
    if (!parsed.success) return

    const envelope = parsed.output as CalendarSocketEnvelope
    handlers.forEach(handler => handler(envelope))
  }

  socketRef.value.onerror = () => {
    statusRef.value = 'error'
  }

  socketRef.value.onclose = () => {
    statusRef.value = 'closed'
    if (!manualClose) {
      scheduleReconnect()
    }
  }
}

function disconnect() {
  clearReconnectTimer()
  manualClose = true
  if (socketRef.value) {
    socketRef.value.close()
    socketRef.value = null
  }
  statusRef.value = 'closed'
}

function onEvent(handler: (event: CalendarSocketEnvelope) => void) {
  handlers.add(handler)
  return () => {
    handlers.delete(handler)
  }
}

export function useCalendarSocket() {
  return {
    status: readonly(statusRef),
    connect,
    disconnect,
    onEvent
  }
}
