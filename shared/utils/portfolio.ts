/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { PortfolioProjectEntry } from '../types/content'
/**
 * Filtry dla projektów portfolio
 */
export interface PortfolioFilters {
  status?: 'draft' | 'published' | 'archived'
  tags?: string[]
  technologies?: string[]
  year?: string
  featured?: boolean
}

/**
 * Abstrakcja pobierania projektów portfolio
 * Obecnie używa Content Layer, w przyszłości może być zastąpione przez API
 */
export async function getPortfolioProjects(filters?: PortfolioFilters): Promise<PortfolioProjectEntry[]> {
  // Obecnie: queryCollection('portfolio')
  // W przyszłości: może być API call
  // Struktura danych pozostaje identyczna

  let query = queryCollection<PortfolioProjectEntry>('portfolio')

  // Filtrowanie po statusie (domyślnie tylko published)
  const status = filters?.status || 'published'
  query = query.where('status', '=', status)

  // Filtrowanie po tagach
  if (filters?.tags && filters.tags.length > 0) {
    query = query.where('tags', 'IN', filters.tags)
  }

  // Filtrowanie po technologiach
  if (filters?.technologies && filters.technologies.length > 0) {
    query = query.where('technologies', 'IN', filters.technologies)
  }

  // Filtrowanie po roku
  if (filters?.year) {
    query = query.where('year', '=', filters.year)
  }

  // Filtrowanie po featured
  if (filters?.featured !== undefined) {
    query = query.where('featured', '=', filters.featured)
  }

  // Sortowanie (domyślnie: publishedAt DESC, fallback: year DESC)
  query = query.order('publishedAt', 'DESC')

  return await query.all()
}

/**
 * Abstrakcja pobierania pojedynczego projektu portfolio
 * Obecnie używa Content Layer, w przyszłości może być zastąpione przez API
 */
export async function getPortfolioProject(slug: string): Promise<PortfolioProjectEntry | null> {
  // Obecnie: queryCollection('portfolio').where('slug', '=', slug).first()
  // W przyszłości: może być API call

  const project = await queryCollection<PortfolioProjectEntry>('portfolio')
    .where('slug', '=', slug)
    .where('status', '=', 'published')
    .first()

  return project || null
}

/**
 * Pobiera wszystkie unikalne tagi z projektów
 */
export async function getPortfolioTags(): Promise<string[]> {
  const projects = await queryCollection<PortfolioProjectEntry>('portfolio')
    .where('status', '=', 'published')
    .all()

  const tagsSet = new Set<string>()
  projects.forEach((project) => {
    if (project.tags && Array.isArray(project.tags)) {
      project.tags.forEach(tag => tagsSet.add(tag))
    }
  })

  return Array.from(tagsSet).sort()
}

/**
 * Pobiera wszystkie unikalne technologie z projektów
 */
export async function getPortfolioTechnologies(): Promise<string[]> {
  const projects = await queryCollection<PortfolioProjectEntry>('portfolio')
    .where('status', '=', 'published')
    .all()

  const technologiesSet = new Set<string>()
  projects.forEach((project) => {
    if (project.technologies && Array.isArray(project.technologies)) {
      project.technologies.forEach(tech => technologiesSet.add(tech))
    }
  })

  return Array.from(technologiesSet).sort()
}

/**
 * Pobiera wszystkie unikalne lata z projektów
 */
export async function getPortfolioYears(): Promise<string[]> {
  const projects = await queryCollection<PortfolioProjectEntry>('portfolio')
    .where('status', '=', 'published')
    .all()

  const yearsSet = new Set<string>()
  projects.forEach((project) => {
    if (project.year) {
      yearsSet.add(project.year)
    }
  })

  return Array.from(yearsSet).sort().reverse() // Najnowsze pierwsze
}
