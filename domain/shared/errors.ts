/**
 * Błędy domenowe
 *
 * Centralne miejsce dla wszystkich błędów związanych z logiką biznesową.
 * Każdy błąd ma kod, komunikat i status HTTP.
 */

export class DomainError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

/**
 * Błąd walidacji danych wejściowych
 */
export class ValidationError extends DomainError {
  constructor(message: string, public issues?: unknown[]) {
    super('VALIDATION_ERROR', message, 400)
  }
}

/**
 * Błąd gdy zasób nie został znaleziony
 */
export class NotFoundError extends DomainError {
  constructor(message: string = 'Resource not found') {
    super('NOT_FOUND', message, 404)
  }
}

/**
 * Błąd gdy zasób już istnieje (duplikat)
 */
export class DuplicateError extends DomainError {
  constructor(message: string = 'Resource already exists') {
    super('DUPLICATE_ERROR', message, 409)
  }
}

/**
 * Błąd autoryzacji (brak uprawnień)
 */
export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401)
  }
}

/**
 * Błąd gdy operacja jest zabroniona
 */
export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super('FORBIDDEN', message, 403)
  }
}
