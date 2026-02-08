export class TeamNotFoundError extends Error {
  constructor(message = 'Team not found') {
    super(message)
    this.name = 'TeamNotFoundError'
  }
}

export class TeamAccessDeniedError extends Error {
  constructor(message = 'Team access denied') {
    super(message)
    this.name = 'TeamAccessDeniedError'
  }
}

export class TeamInviteNotFoundError extends Error {
  constructor(message = 'Team invite not found') {
    super(message)
    this.name = 'TeamInviteNotFoundError'
  }
}

export class TeamInviteConflictError extends Error {
  readonly reason: string

  constructor(reason: string, message = 'Team invite conflict') {
    super(message)
    this.name = 'TeamInviteConflictError'
    this.reason = reason
  }
}

export class TeamMemberNotFoundError extends Error {
  constructor(message = 'Team member not found') {
    super(message)
    this.name = 'TeamMemberNotFoundError'
  }
}

export class TeamRoleForbiddenError extends Error {
  constructor(message = 'Insufficient team role') {
    super(message)
    this.name = 'TeamRoleForbiddenError'
  }
}
