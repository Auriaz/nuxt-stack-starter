import MarkdownIt from 'markdown-it'

let md: MarkdownIt | null = null

function getMd(): MarkdownIt {
  if (!md) md = new MarkdownIt({ html: false })
  return md
}

/**
 * Renderuje Markdown do HTML (po stronie klienta, np. do podglądu w edytorze).
 */
export function useMarkdownRender() {
  function toHtml(markdown: string): string {
    if (!markdown?.trim()) return ''
    return getMd().render(markdown)
  }

  return { toHtml }
}
