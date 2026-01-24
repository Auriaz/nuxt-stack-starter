import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpTool({
  description: `Lists all available Valibot schema files in shared/schemas/ directory.

WHEN TO USE: Use this tool when you need to EXPLORE or DISCOVER available schemas in the project.

WHEN NOT TO USE: If you already know the schema name, use get_schema directly.`,
  inputSchema: {},
  cache: '1h',
  async handler() {
    const schemasDir = join(process.cwd(), 'shared', 'schemas')
    const schemas: Array<{ name: string, file: string }> = []

    try {
      const files = await readdir(schemasDir)

      for (const file of files) {
        if (!file.endsWith('.ts')) continue

        const schemaName = file.replace(/\.ts$/, '')
        schemas.push({
          name: schemaName,
          file: `shared/schemas/${file}`
        })
      }
    } catch (error) {
      return errorResult(`Failed to read schemas directory: ${error}`)
    }

    return jsonResult(schemas.sort((a, b) => a.name.localeCompare(b.name)))
  }
})
