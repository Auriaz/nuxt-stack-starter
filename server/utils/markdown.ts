import MarkdownIt from 'markdown-it'
import { slugify } from '~~/shared/utils/content'

function createMdWithAnchors(): {
  md: MarkdownIt
  getToc: () => TocEntry[]
} {
  const toc: TocEntry[] = []
  const seenIds = new Map<string, number>()

  const md = new MarkdownIt({ html: false })

  const defaultHeadingOpen
    = md.renderer.rules.heading_open
      || ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (!token) return defaultHeadingOpen(tokens, idx, options, env, self)
    const level = parseInt(token.tag.slice(1), 10)
    const nextToken = tokens[idx + 1]
    const rawText
      = nextToken?.type === 'inline' && nextToken.content ? nextToken.content : ''
    const text = rawText.replace(/<[^>]+>/g, '').trim() || `heading-${level}`
    let id = slugify(text) || `h-${level}`
    const count = seenIds.get(id) ?? 0
    seenIds.set(id, count + 1)
    if (count > 0) id = `${id}-${count}`
    token.attrSet('id', id)
    toc.push({ depth: level, id, text })
    return defaultHeadingOpen(tokens, idx, options, env, self)
  }

  return {
    md,
    getToc: () => [...toc]
  }
}

/**
 * Renderuje Markdown do HTML z id na nagłówkach i zwraca spis treści.
 */
export function renderMarkdownWithToc(markdown: string): { html: string, toc: TocEntry[] } {
  if (!markdown?.trim()) return { html: '', toc: [] }
  const { md, getToc } = createMdWithAnchors()
  const html = md.render(markdown)
  return { html, toc: getToc() }
}

/**
 * Renderuje Markdown do HTML (używane np. dla bodyMd posta blogowego).
 */
export function renderMarkdown(markdown: string): string {
  const { html } = renderMarkdownWithToc(markdown)
  return html
}
