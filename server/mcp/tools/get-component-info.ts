import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpTool({
  description: `Gets information about a Vue component including props, structure, and usage.

WHEN TO USE: Use this tool when you need to understand how a component works or what props it accepts.

WHEN NOT TO USE: If you need to list all components, explore the codebase directly.`,
  inputSchema: {
    componentPath: z.string().describe('Path to component relative to app/components/, e.g., "sections/Hero/SectionsHero" or "ui/Section"')
  },
  cache: '30m',
  async handler({ componentPath }) {
    // Normalize path - remove .vue extension if present, add if missing
    const normalizedPath = componentPath.endsWith('.vue')
      ? componentPath.replace(/\.vue$/, '')
      : componentPath

    const componentFile = join(process.cwd(), 'app', 'components', `${normalizedPath}.vue`)

    try {
      const content = await readFile(componentFile, 'utf-8')

      // Extract props from defineProps
      const propsMatch = content.match(/defineProps<[^>]+>/g)
      const props = propsMatch ? propsMatch.map(m => m.replace(/defineProps<|>/g, '')) : []

      // Extract imports
      const importMatches = content.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)
      const imports = Array.from(importMatches).map(m => m[1])

      // Extract slots usage
      const slotMatches = content.matchAll(/<slot\s+name="([^"]+)"/g)
      const slots = Array.from(slotMatches).map(m => m[1])

      return jsonResult({
        componentPath: `app/components/${normalizedPath}.vue`,
        file: `${normalizedPath}.vue`,
        content,
        props: props.length > 0 ? props : 'No props found',
        imports,
        slots: slots.length > 0 ? slots : 'No named slots found'
      })
    } catch {
      return errorResult(`Component file not found: ${componentPath}.vue. Make sure the path is relative to app/components/`)
    }
  }
})
