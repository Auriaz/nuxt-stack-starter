import { defineContentConfig, defineCollection } from '@nuxt/content'
import { BlogPostSchema, PageSchema, PortfolioProjectSchema } from './shared/schemas/content'
import { FooterConfigSchema } from './shared/schemas/footer'

export default defineContentConfig({
  collections: {
    // content: defineCollection({
    //   type: 'page',
    //   source: '**/*.md'
    // }),
    pages: defineCollection({
      type: 'page',
      source: '*.md',
      schema: PageSchema
    }),
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: BlogPostSchema
    }),
    portfolio: defineCollection({
      type: 'page',
      source: 'portfolio/*.md',
      schema: PortfolioProjectSchema
    }),
    app: defineCollection({
      type: 'data',
      source: 'app/*.md',
      schema: FooterConfigSchema
    })
  }
})
