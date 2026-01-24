import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpTool({
  description: `Gets the Prisma database schema with all models and their fields.

WHEN TO USE: Use this tool when you need to understand the DATABASE STRUCTURE or create queries.

WHEN NOT TO USE: If you need to query data, use database query tools instead.`,
  inputSchema: {},
  cache: '1h',
  async handler() {
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')

    try {
      const content = await readFile(schemaPath, 'utf-8')

      // Extract models from schema
      const modelMatches = content.matchAll(/model\s+(\w+)\s*\{([^}]+)\}/gs)
      const models: Array<{ name: string, fields: string[] }> = []

      for (const match of modelMatches) {
        const modelName = match[1]
        const modelBody = match[2]
        const fields = modelBody
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.startsWith('//') && !line.startsWith('@@'))
          .map(line => line.replace(/\s+/g, ' '))

        models.push({ name: modelName, fields })
      }

      return jsonResult({
        file: 'prisma/schema.prisma',
        rawSchema: content,
        models
      })
    } catch (error) {
      return errorResult(`Failed to read Prisma schema: ${error}`)
    }
  }
})
