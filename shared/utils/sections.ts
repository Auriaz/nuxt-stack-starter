import type { Page } from '../types/content'
import type { Section } from '../types/sections'

/**
 * Konwertuje legacy format (hero, features) do nowego formatu sections[]
 * Dla backward compatibility
 */
export function convertLegacyToSections(page: Page): Section[] {
  const sections: Section[] = []

  // Konwersja hero
  if (page.hero) {
    sections.push({
      type: 'hero',
      id: 'hero',
      enabled: true,
      title: page.hero.title,
      subtitle: page.hero.subtitle,
      eyebrow: page.hero.eyebrow,
      description: page.hero.description,
      align: 'center',
      theme: 'light',
      container: 'default',
      spacing: 'lg',
      props: {
        layout: page.hero.layout || 'centered',
        variant: page.hero.variant || 'primary',
        image: page.hero.image,
        actions: page.hero.actions || [],
        badges: []
      },
      schema: page.hero.schema
    } as Section)
  }

  // Konwersja features
  if (page.features) {
    sections.push({
      type: 'features',
      id: 'features',
      enabled: true,
      title: page.features.title,
      description: page.features.description,
      align: page.features.options?.align || 'center',
      theme: page.features.options?.theme || 'light',
      container: 'default',
      spacing: 'lg',
      props: {
        items: page.features.items,
        layout: page.features.options?.layout || 'grid',
        columns: page.features.options?.columns || 3,
        variant: page.features.options?.variant || 'cards'
      }
    } as Section)
  }

  return sections
}

/**
 * Pobiera sekcje z page - używa sections[] lub konwertuje legacy
 */
export function getPageSections(page: Page): Section[] {
  if (page.sections && page.sections.length > 0) {
    return page.sections
  }

  // Fallback do legacy
  return convertLegacyToSections(page)
}
