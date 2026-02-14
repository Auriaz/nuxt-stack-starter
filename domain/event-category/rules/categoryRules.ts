import type { EventCategoryRecord } from '~~/server/repositories/eventCategory.repo'
import { PERMISSIONS } from '#shared/permissions'

/**
 * Sprawdza czy użytkownik może usunąć kategorię
 */
export function canDeleteCategory(
  category: EventCategoryRecord,
  userId: number,
  permissions: string[]
): boolean {
  if (permissions.includes(PERMISSIONS.ADMIN_ACCESS)) {
    return true
  }

  // Nie można usunąć kategorii systemowej (tylko admin z category.system.manage)
  if (category.isSystem && !permissions.includes(PERMISSIONS.CATEGORY_SYSTEM_MANAGE)) {
    return false
  }

  // Kategorie teamowe: team manager
  if (category.teamId && permissions.includes(PERMISSIONS.CATEGORY_TEAM_MANAGE)) {
    return true
  }

  // Kategorie osobiste: tylko właściciel
  if (category.userId === userId && permissions.includes(PERMISSIONS.CATEGORY_DELETE)) {
    return true
  }

  return false
}

/**
 * Sprawdza czy użytkownik może edytować kategorię
 */
export function canEditCategory(
  category: EventCategoryRecord,
  userId: number,
  permissions: string[]
): boolean {
  if (permissions.includes(PERMISSIONS.ADMIN_ACCESS)) {
    return true
  }

  // Kategorie systemowe: tylko admin
  if (category.isSystem && !permissions.includes(PERMISSIONS.CATEGORY_SYSTEM_MANAGE)) {
    return false
  }

  // Kategorie teamowe: team manager
  if (category.teamId && permissions.includes(PERMISSIONS.CATEGORY_TEAM_MANAGE)) {
    return true
  }

  // Kategorie osobiste: tylko właściciel
  if (category.userId === userId && permissions.includes(PERMISSIONS.CATEGORY_EDIT)) {
    return true
  }

  return false
}

/**
 * Normalizuje slug (lowercase, kebab-case)
 */
export function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Zwraca scope kategorii na podstawie userId i teamId
 */
export function getCategoryScope(category: EventCategoryRecord): 'system' | 'personal' | 'team' {
  if (category.userId === null && category.teamId === null) {
    return 'system'
  }
  if (category.teamId !== null) {
    return 'team'
  }
  return 'personal'
}
