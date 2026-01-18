import type { PortfolioProjectEntry } from '#shared/types/content'
import type { PortfolioCardProps, PortfolioContentOptions } from '#shared/types/portfolio'
import { getPortfolioProjects } from '#shared/utils/portfolio'

/**
 * Funkcja pomocnicza do wyodrębnienia slug z path
 */
function extractSlugFromPath(path: string): string {
  // Przykład: /portfolio/project-1 -> project-1
  const parts = path.split('/').filter(Boolean)
  return parts[parts.length - 1] || ''
}

/**
 * Mapuje PortfolioProjectEntry do PortfolioCardProps
 */
function mapProjectToCardProps(project: PortfolioProjectEntry): PortfolioCardProps {
  const slug = project.slug || extractSlugFromPath(project._path)

  return {
    id: project._id || project._path,
    title: project.title,
    excerpt: project.excerpt || project.description,
    coverImage: {
      src: project.coverImage?.src || '',
      alt: project.coverImage?.alt || project.title
    },
    tags: project.technologies || project.tags || [],
    year: project.year,
    slug,
    featured: project.featured || false,
    to: slug ? `/portfolio/${slug}` : project._path || '#',
    category: project.category || project.tags?.[0],
    externalLink: project.links?.[0]
      ? {
          url: project.links[0].url,
          target: project.links[0].target
        }
      : undefined
  }
}

/**
 * Sortuje projekty według opcji
 */
function sortProjects(
  projects: PortfolioCardProps[],
  sortBy: 'newest' | 'oldest' | 'featured'
): PortfolioCardProps[] {
  const sorted = [...projects]

  if (sortBy === 'featured') {
    return sorted.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return 0
    })
  }

  // Dla newest/oldest sortujemy po year (jeśli dostępne)
  // W przyszłości można dodać sortowanie po publishedAt
  return sorted.sort((a, b) => {
    if (!a.year || !b.year) return 0

    const yearA = parseInt(a.year, 10)
    const yearB = parseInt(b.year, 10)

    if (sortBy === 'newest') {
      return yearB - yearA // Najnowsze pierwsze
    } else {
      return yearA - yearB // Najstarsze pierwsze
    }
  })
}

/**
 * Composable do pobierania i przetwarzania projektów portfolio
 *
 * @param options - Opcje konfiguracji (limit, filtry, sortowanie)
 * @returns Reactive data z projektami w formacie PortfolioCardProps
 *
 * @example
 * ```ts
 * const { projects, pending } = usePortfolioContent({
 *   limit: 6,
 *   showFeaturedOnly: true,
 *   sortBy: 'newest'
 * })
 * ```
 */
export function usePortfolioContent(options?: PortfolioContentOptions) {
  const { data, pending, error, refresh } = useAsyncData(
    `portfolio-content-${JSON.stringify(options)}`,
    async () => {
      // Pobierz projekty z warstwy danych
      const projects = await getPortfolioProjects({
        status: options?.status || 'published',
        tags: options?.filterByTags,
        technologies: options?.filterByTechnologies,
        year: options?.filterByYear,
        featured: options?.showFeaturedOnly ? true : undefined
      })

      // Mapuj do PortfolioCardProps
      const mapped = projects.map(mapProjectToCardProps)

      // Sortowanie
      const sorted = sortProjects(mapped, options?.sortBy || 'newest')

      // Limit
      return options?.limit ? sorted.slice(0, options.limit) : sorted
    }
  )

  return {
    projects: computed(() => data.value || []),
    pending,
    error,
    refresh
  }
}
