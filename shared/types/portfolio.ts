/**
 * Stabilny kontrakt danych dla komponentu PortfolioCard
 * Komponent jest czysto prezentacyjny i nie zależy od content layer
 */
export interface PortfolioCardProps {
  id: string
  title: string
  excerpt: string // description lub excerpt
  coverImage: {
    src: string
    alt: string
  }
  tags: string[] // technologie lub tags
  year?: string
  slug: string
  featured: boolean
  to: string // link do /portfolio/[slug]
  category?: string // pierwszy tag lub category field
  externalLink?: {
    url: string
    target?: string
  } // pierwszy link z project.links
}

/**
 * Opcje konfiguracji dla composable usePortfolioContent
 */
export interface PortfolioContentOptions {
  limit?: number
  showFeaturedOnly?: boolean
  filterByTags?: string[]
  filterByTechnologies?: string[]
  filterByYear?: string
  sortBy?: 'newest' | 'oldest' | 'featured'
  status?: 'draft' | 'published' | 'archived'
}
