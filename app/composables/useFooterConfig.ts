/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Top-level await is supported in Nuxt 3/4 via Vite
import type { FooterConfig, FooterConfigEntry, FooterSocial } from '#shared/types/footer'
import appMeta from '~/app.meta'

/**
 * Composable do pobierania konfiguracji footera z Content Layer z fallback do app.meta
 *
 * @returns Reactive data z konfiguracją footera
 *
 * @example
 * ```ts
 * const { config } = useFooterConfig()
 * ```
 */
export function useFooterConfig() {
  const { data, pending, error, refresh } = useAsyncData('footer-config', async () => {
    // Pobierz dane z content/app/footer.md
    let footerData: FooterConfigEntry | null = null

    try {
      // Dla kolekcji typu 'data' pobieramy wszystkie i filtrujemy po _path
      const results = await queryCollection<FooterConfigEntry>('app').all()
      footerData = results.find(item => item._path === '/app/footer')
        || results.find(item => item._path?.endsWith('/footer'))
        || results[0]
        || null
    } catch {
      // Jeśli plik nie istnieje, footerData pozostanie null
      // eslint-disable-next-line no-console
      console.warn('Footer config not found in content, using fallback from app.meta')
    }

    // Fallback do app.meta
    const fallbackConfig: FooterConfig = {
      brand: {
        name: appMeta.name,
        description: appMeta.description,
        logo: appMeta.icon
      },
      contact: {
        email: appMeta.contactEmail
      },
      social: (appMeta.sameAs || []).map((url: string) => {
        // Mapuj URL do FooterSocial
        const name = extractSocialName(url)
        const icon = getSocialIcon(name)

        return {
          name,
          href: url,
          icon
        }
      }) as FooterSocial[],
      legal: {
        companyName: appMeta.name
      },
      theme: 'light',
      container: 'default',
      spacing: 'md',
      schema: {
        enabled: true
      }
    }

    // Merge: content data + fallback (content ma priorytet)
    const mergedConfig: FooterConfig = {
      brand: footerData?.brand || fallbackConfig.brand,
      columns: footerData?.columns || [],
      contact: {
        ...fallbackConfig.contact,
        ...footerData?.contact
      },
      social: footerData?.social || fallbackConfig.social,
      legal: {
        ...fallbackConfig.legal,
        ...footerData?.legal
      },
      newsletter: footerData?.newsletter,
      backToTop: footerData?.backToTop ?? true,
      theme: footerData?.theme || fallbackConfig.theme,
      container: footerData?.container || fallbackConfig.container,
      spacing: footerData?.spacing || fallbackConfig.spacing,
      schema: {
        enabled: footerData?.schema?.enabled ?? fallbackConfig.schema?.enabled ?? true
      }
    }

    return mergedConfig
  })

  return {
    config: computed(() => data.value || ({} as FooterConfig)),
    pending,
    error,
    refresh
  }
}

/**
 * Wyodrębnia nazwę platformy social z URL
 */
function extractSocialName(url: string): string {
  try {
    const hostname = new URL(url).hostname.toLowerCase()

    if (hostname.includes('github')) return 'GitHub'
    if (hostname.includes('twitter') || hostname.includes('x.com')) return 'Twitter'
    if (hostname.includes('linkedin')) return 'LinkedIn'
    if (hostname.includes('facebook')) return 'Facebook'
    if (hostname.includes('instagram')) return 'Instagram'
    if (hostname.includes('youtube')) return 'YouTube'

    // Dla innych domen, użyj nazwy domeny
    return hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1)
  } catch {
    return 'Website'
  }
}

/**
 * Zwraca ikonę dla platformy social
 */
function getSocialIcon(name: string): string {
  const iconMap: Record<string, string> = {
    GitHub: 'i-simple-icons-github',
    Twitter: 'i-simple-icons-twitter',
    LinkedIn: 'i-simple-icons-linkedin',
    Facebook: 'i-simple-icons-facebook',
    Instagram: 'i-simple-icons-instagram',
    YouTube: 'i-simple-icons-youtube'
  }

  return iconMap[name] || 'i-lucide-globe'
}
