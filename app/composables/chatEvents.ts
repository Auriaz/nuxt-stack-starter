export const CHAT_EVENTS = {
  MESSAGE_SEND: 'chat.message.send',
  MESSAGE_NEW: 'chat.message.new',
  MESSAGE_DELTA: 'chat.message.delta',
  THREAD_JOIN: 'chat.thread.join',
  THREAD_JOINED: 'chat.thread.joined',
  THREAD_LEAVE: 'chat.thread.leave',
  THREAD_LEFT: 'chat.thread.left',
  READ_UPDATE: 'chat.read.update',
  READ_UPDATED: 'chat.read.updated',
  TYPING: 'chat.typing',
  ERROR: 'chat.error'
} as const

export type ChatEventType = typeof CHAT_EVENTS[keyof typeof CHAT_EVENTS]
