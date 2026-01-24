import { z } from 'zod'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpTool({
  description: `Lists all available API endpoints in the application.

WHEN TO USE: Use this tool when you need to EXPLORE or DISCOVER available API endpoints.

WHEN NOT TO USE: If you already know the specific endpoint path, use it directly.`,
  inputSchema: {
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'ALL']).optional().default('ALL').describe('Filter by HTTP method')
  },
  cache: '1h',
  async handler({ method }) {
    const apiDir = join(process.cwd(), 'server', 'api')
    const endpoints: Array<{ path: string, method: string, file: string }> = []

    try {
      const files = await readdir(apiDir, { recursive: true })

      for (const file of files) {
        if (!file.endsWith('.ts')) continue

        const relativePath = file.replace(/\.ts$/, '')

        // Extract HTTP method from filename (e.g., users.get.ts -> GET)
        const methodMatch = relativePath.match(/\.(get|post|put|delete|patch)$/i)
        const httpMethod = methodMatch ? methodMatch[1].toUpperCase() : 'GET'

        if (method !== 'ALL' && httpMethod !== method) continue

        // Convert file path to API route
        const route = '/' + relativePath
          .replace(/\.(get|post|put|delete|patch)$/i, '')
          .replace(/\\/g, '/')
          .replace(/\/index$/, '')
          .replace(/\[([^\]]+)\]/g, ':$1')

        endpoints.push({
          path: `/api${route}`,
          method: httpMethod,
          file: `server/api/${file}`
        })
      }
    } catch (error) {
      return errorResult(`Failed to read API directory: ${error}`)
    }

    return jsonResult(endpoints.sort((a, b) => a.path.localeCompare(b.path)))
  }
})
