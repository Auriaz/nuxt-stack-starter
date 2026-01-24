import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpPrompt({
  description: 'Guide to add a new API endpoint following the project architecture. Requires endpointName and method parameters',
  inputSchema: {
    endpointName: z.string().optional().describe('Name of the endpoint (e.g., "products", "orders"). If not provided, returns general guide.'),
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional().describe('HTTP method for the endpoint')
  },
  async handler({ endpointName, method }) {
    // If required parameters are not provided, return general guide
    if (!endpointName || !method) {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need help adding a new API endpoint. To use this prompt effectively, please provide both endpointName and method parameters.

Example usage:
- "Jak dodać endpoint API dla produktów?" (will use endpointName: "products", method: "GET" or "POST")
- "Stwórz endpoint POST dla zamówień" (will use endpointName: "orders", method: "POST")

General steps to add a new API endpoint:
1. Create endpoint file: server/api/{endpointName}.{method.toLowerCase()}.ts
2. Add input/output schemas in shared/schemas/api.ts (Valibot)
3. Create use-case in domain/{endpointName}/ (business logic)
4. Create repository in server/repositories/{endpointName}.repo.ts (Prisma queries)
5. Create resource composable in app/composables/resources/use{EndpointName}Resource.ts (only fetch in UI)

The endpoint should:
- Parse input → Validate (Valibot) → Call use-case → Return DTO
- NOT contain business logic (that goes in domain/)
- Use Result pattern for error handling
- Follow the existing patterns

Please provide both endpointName and method to get detailed, step-by-step guidance.`
          }
        }]
      }
    }
    try {
      // Read example endpoint
      const examplePath = join(process.cwd(), 'server', 'api', 'users', 'index.get.ts')
      let exampleContent = ''
      try {
        exampleContent = await readFile(examplePath, 'utf-8')
      } catch {
        // Fallback to health endpoint
        const healthPath = join(process.cwd(), 'server', 'api', 'health.get.ts')
        exampleContent = await readFile(healthPath, 'utf-8')
      }

      // Read architecture guide
      const readmePath = join(process.cwd(), 'README.md')
      const readmeContent = await readFile(readmePath, 'utf-8')
      const architectureMatch = readmeContent.match(/## 🏗️ Architektura([\s\S]*?)(?=##|$)/)
      const architectureSection = architectureMatch ? architectureMatch[1] : ''

      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Help me add a new API endpoint "${endpointName}" with method ${method} following the project's architecture.

Here's the architecture:
${architectureSection}

Example endpoint structure:
\`\`\`typescript
${exampleContent.substring(0, 400)}...
\`\`\`

Steps to add a new API endpoint:
1. Create endpoint file: server/api/${endpointName}.${method.toLowerCase()}.ts
2. Add input/output schemas in shared/schemas/api.ts (Valibot)
3. Create use-case in domain/${endpointName}/ (business logic)
4. Create repository in server/repositories/${endpointName}.repo.ts (Prisma queries)
5. Create resource composable in app/composables/resources/use${endpointName.charAt(0).toUpperCase() + endpointName.slice(1)}Resource.ts (only fetch in UI)

The endpoint should:
- Parse input → Validate (Valibot) → Call use-case → Return DTO
- NOT contain business logic (that goes in domain/)
- Use Result pattern for error handling
- Follow the existing patterns

Please guide me through creating this endpoint step by step.`
          }
        }]
      }
    } catch (error) {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Error loading project structure: ${error}. Please help me add a new API endpoint "${endpointName}" with method ${method} following the project architecture.`
          }
        }]
      }
    }
  }
})
