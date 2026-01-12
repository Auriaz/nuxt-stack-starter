import { defineContentConfig, defineCollection } from '@nuxt/content'
import { BlogPostSchema } from './shared/schemas/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '**/*.md',
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: BlogPostSchema,
    }),
  },
})
