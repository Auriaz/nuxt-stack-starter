/**
 * Result pattern dla bezpiecznego obsługiwania błędów
 *
 * Zamiast rzucać wyjątki, funkcje zwracają Result<T, E>.
 * To pozwala na jawną obsługę błędów i lepszą testowalność.
 *
 * @example
 * ```ts
 * const result = await someUseCase(input)
 * if (isErr(result)) {
 *   // Obsługa błędu
 *   console.error(result.error)
 *   return
 * }
 * // Użycie wartości
 * console.log(result.value)
 * ```
 */

export type Result<T, E> = Ok<T> | Err<E>

export interface Ok<T> {
  readonly ok: true
  readonly value: T
}

export interface Err<E> {
  readonly ok: false
  readonly error: E
}

/**
 * Tworzy wynik sukcesu
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

/**
 * Tworzy wynik błędu
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}

/**
 * Sprawdza czy wynik jest sukcesem
 */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true
}

/**
 * Sprawdza czy wynik jest błędem
 */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false
}
