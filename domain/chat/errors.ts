export class ChatThreadNotFoundError extends Error {
  code = 'CHAT_THREAD_NOT_FOUND'

  constructor(message = 'Thread not found') {
    super(message)
  }
}

export class ChatAccessDeniedError extends Error {
  code = 'CHAT_ACCESS_DENIED'

  constructor(message = 'Access denied') {
    super(message)
  }
}
