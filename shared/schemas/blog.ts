import { object, string, optional, array, number, picklist, nullable } from 'valibot'

/** Query listy postów (GET /api/blog, GET /api/dashboard/blog) */
export const BlogListQuerySchema = object({
  page: optional(number()),
  perPage: optional(number()),
  search: optional(string()),
  tags: optional(array(string())),
  status: optional(picklist(['published', 'draft', 'all'] as const))
})

/** Jedna kotwica (label + href + opcjonalnie icon, target) */
export const BlogAnchorItemSchema = object({
  label: string(),
  to: string(),
  order: optional(number()),
  icon: optional(string()),
  target: optional(string())
})

/** Body tworzenia postu (POST /api/dashboard/blog) */
export const BlogPostCreateSchema = object({
  slug: string(),
  title: string(),
  description: optional(string()),
  bodyMd: string(),
  imageUrl: optional(string()),
  publishedAt: optional(string()), // ISO date lub null = draft
  tags: optional(array(string())),
  anchors: optional(array(BlogAnchorItemSchema)),
  seoTitle: optional(string()),
  seoDesc: optional(string())
})

/** Body aktualizacji postu (PATCH /api/dashboard/blog/:id) */
export const BlogPostUpdateSchema = object({
  slug: optional(string()),
  title: optional(string()),
  description: optional(string()),
  bodyMd: optional(string()),
  imageUrl: optional(string()),
  publishedAt: optional(nullable(string())),
  tags: optional(array(string())),
  anchors: optional(array(BlogAnchorItemSchema)),
  seoTitle: optional(string()),
  seoDesc: optional(string())
})

/** Body tworzenia tagu (POST /api/dashboard/blog/tags) */
export const BlogTagCreateSchema = object({
  name: string()
})
