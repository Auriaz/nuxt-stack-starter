import { defineContentConfig, defineCollection } from '@nuxt/content'
import { BlogPostSchema, PageSchema } from './shared/schemas/content'

export default defineContentConfig({
  collections: {
    pages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: PageSchema
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: BlogPostSchema
    })
  }
})
