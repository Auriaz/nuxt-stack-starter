import type { BlogPost } from '../types/content'
import { BlogPostSchema } from '../schemas/content'
import * as v from 'valibot'

/**
 * Type guard sprawdzający czy dane są typu BlogPost
 */
export function isBlogPost(data: unknown): data is BlogPost {
  return v.is(BlogPostSchema, data)
}

/**
 * Waliduje czy string jest poprawnym adresem email
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Sprawdza czy wartość nie jest null ani undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

/**
 * Sprawdza czy wartość jest stringiem i nie jest pusta
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
