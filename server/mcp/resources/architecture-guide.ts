import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpResource({
  uri: 'resource://fullstack-base/architecture-guide',
  description: 'Complete architecture guide explaining the project structure, layers, and data flow',
  cache: '1h',
  async handler(uri: URL) {
    try {
      const readmePath = join(process.cwd(), 'README.md')
      const content = await readFile(readmePath, 'utf-8')

      // Extract architecture section
      const architectureMatch = content.match(/## 🏗️ Architektura([\s\S]*?)(?=##|$)/)
      const architectureSection = architectureMatch ? architectureMatch[1] : 'Architecture section not found'

      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/markdown',
          text: `# Architecture Guide

${architectureSection}

## Key Principles

1. **UI Layer** (app/): Presentation only, no fetch logic
2. **Resources Layer** (app/composables/resources/): Only place where UI fetches data
3. **API Layer** (server/api/): Parse → Validate → Use-case → DTO
4. **Domain Layer** (domain/): Business logic and use-cases
5. **Repository Layer** (server/repositories/): Database abstraction
6. **Data Layer** (Prisma): Database models

## Data Flow

\`\`\`
UI Component → Resource Composable → API Endpoint → Use-case → Repository → Database
\`\`\`
`
        }]
      }
    } catch (error) {
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'text/plain',
          text: `Error reading architecture guide: ${error}`
        }]
      }
    }
  }
})
