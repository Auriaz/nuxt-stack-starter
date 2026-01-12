import type { SEO } from '#shared/types/common'

/**
 * Typ dla usePageSeo - wymaga title i description
 */
export type PageSeoMeta = SEO & {
  title: string
  description: string
}

/**
 * Composable do zarządzania SEO meta tags dla stron
 * @param meta - Obiekt z meta danymi strony
 */
export const usePageSeo = (meta: PageSeoMeta) => {
  const config = useRuntimeConfig()
  const route = useRoute()
  const siteUrl = config.public.siteUrl || 'https://example.com'
  const currentUrl = `${siteUrl}${route.path}`

  // Domyślny obraz OG
  const ogImage = meta.image || `${siteUrl}/images/og-image.png`

  // Ustawienie podstawowych meta tags
  useSeoMeta({
    title: meta.title,
    description: meta.description,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogImage,
    ogType: meta.ogType || 'website',
    twitterCard: 'summary_large_image',
    twitterImage: ogImage,
    robots: meta.noindex ? 'noindex,nofollow' : 'index,follow'
  })

  // Canonical URL
  useHead({
    link: [
      {
        rel: 'canonical',
        href: currentUrl
      }
    ]
  })

  // Dodatkowe meta dla artykułów
  if (meta.ogType === 'article') {
    useSeoMeta({
      articlePublishedTime: meta.publishedTime,
      articleModifiedTime: meta.modifiedTime,
      articleAuthor: meta.author,
      ...(meta.tags ? { articleTag: meta.tags } : {})
    } as Parameters<typeof useSeoMeta>[0])
  }

  return {
    siteUrl,
    currentUrl,
    ogImage
  }
}
