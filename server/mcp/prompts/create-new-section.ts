import { z } from 'zod'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineMcpPrompt({
  description: 'Guide to create a new page section following the project architecture. Requires sectionName parameter (e.g., "gallery", "testimonials")',
  inputSchema: {
    sectionName: z.string().optional().describe('Name of the new section (e.g., "testimonials", "gallery"). If not provided, returns general guide.'),
    sectionType: z.string().optional().describe('Type identifier for the section (defaults to sectionName)')
  },
  async handler({ sectionName, sectionType }) {
    // If sectionName is not provided, return general guide
    if (!sectionName) {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `I need help creating a new page section. To use this prompt effectively, please provide the sectionName parameter.

Example usage:
- "Pomóż mi utworzyć nową sekcję Gallery" (will use sectionName: "gallery")
- "Stwórz sekcję Testimonials" (will use sectionName: "testimonials")

General steps to create a new section:
1. Add schema in shared/schemas/sections.ts extending SectionBaseSchema
2. Add type in shared/types/sections.ts (if using TypeScript types)
3. Create component in app/components/Sections/{SectionName}/Sections{SectionName}.vue
4. Register component in app/components/sections/SectionsRenderer.vue
5. Use PageSection wrapper in the component

The section should:
- Extend SectionBaseSchema
- Use PageSection component as wrapper
- Render only content (no layout logic)
- Follow the existing section patterns

Please provide the section name to get detailed, step-by-step guidance.`
          }
        }]
      }
    }

    const type = sectionType || sectionName

    try {
      // Read sections schema to show the pattern
      const schemaPath = join(process.cwd(), 'shared', 'schemas', 'sections.ts')
      const schemaContent = await readFile(schemaPath, 'utf-8')

      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Help me create a new page section called "${sectionName}" (type: "${type}") following the project's architecture.

Here's the current sections schema structure:
\`\`\`typescript
${schemaContent.substring(0, 500)}...
\`\`\`

Steps to create a new section:
1. Add schema in shared/schemas/sections.ts extending SectionBaseSchema
2. Add type in shared/types/sections.ts
3. Create component in app/components/Sections/${sectionName}/Sections${sectionName}.vue
4. Register component in app/components/sections/SectionsRenderer.vue
5. Use PageSection wrapper in the component

The section should:
- Extend SectionBaseSchema
- Use PageSection component as wrapper
- Render only content (no layout logic)
- Follow the existing section patterns

Please guide me through creating this section step by step.`
          }
        }]
      }
    } catch (error) {
      return {
        messages: [{
          role: 'user' as const,
          content: {
            type: 'text' as const,
            text: `Error loading section schema: ${error}. Please create a new section "${sectionName}" following the project architecture.`
          }
        }]
      }
    }
  }
})
