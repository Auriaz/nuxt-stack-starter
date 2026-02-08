export class FriendRequestNotFoundError extends Error {
  constructor(message = 'Friend request not found') {
    super(message)
    this.name = 'FriendRequestNotFoundError'
  }
}

export class FriendAccessDeniedError extends Error {
  constructor(message = 'Friend access denied') {
    super(message)
    this.name = 'FriendAccessDeniedError'
  }
}

export class FriendRequestConflictError extends Error {
  readonly reason: string

  constructor(reason: string, message = 'Friend request conflict') {
    super(message)
    this.name = 'FriendRequestConflictError'
    this.reason = reason
  }
}

export class FriendBlockedError extends Error {
  constructor(message = 'User is blocked') {
    super(message)
    this.name = 'FriendBlockedError'
  }
}

export class FriendSelfInviteError extends Error {
  constructor(message = 'Cannot invite yourself') {
    super(message)
    this.name = 'FriendSelfInviteError'
  }
}
