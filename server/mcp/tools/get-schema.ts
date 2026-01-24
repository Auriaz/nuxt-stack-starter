import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpTool({
  description: `Gets the content of a specific schema file from shared/schemas/.

WHEN TO USE: Use this tool when you need to see the STRUCTURE or DEFINITION of a schema (Valibot schema).

WHEN NOT TO USE: If you need to list all schemas, use list-schemas instead.`,
  inputSchema: {
    schemaName: z.string().describe('Name of the schema file (without .ts extension), e.g., "sections", "api", "content"')
  },
  cache: '30m',
  async handler({ schemaName }) {
    const schemaPath = join(process.cwd(), 'shared', 'schemas', `${schemaName}.ts`)

    try {
      const content = await readFile(schemaPath, 'utf-8')
      return jsonResult({
        schemaName,
        file: `shared/schemas/${schemaName}.ts`,
        content
      })
    } catch {
      return errorResult(`Schema file not found: ${schemaName}.ts. Available schemas: sections, api, content, common, user, auth, footer`)
    }
  }
})
