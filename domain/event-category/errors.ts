export class EventCategoryNotFoundError extends Error {
  constructor(message = 'Event category not found') {
    super(message)
    this.name = 'EventCategoryNotFoundError'
  }
}

export class EventCategoryAccessDeniedError extends Error {
  constructor(message = 'Access denied to event category') {
    super(message)
    this.name = 'EventCategoryAccessDeniedError'
  }
}

export class EventCategoryValidationError extends Error {
  readonly issues?: Array<{ path: string, message: string }>

  constructor(message = 'Event category validation error', issues?: Array<{ path: string, message: string }>) {
    super(message)
    this.name = 'EventCategoryValidationError'
    this.issues = issues
  }
}

export class EventCategoryConflictError extends Error {
  constructor(message = 'Event category already exists') {
    super(message)
    this.name = 'EventCategoryConflictError'
  }
}

export class EventCategoryPermissionError extends Error {
  constructor(message = 'Insufficient permissions for event category operation') {
    super(message)
    this.name = 'EventCategoryPermissionError'
  }
}
