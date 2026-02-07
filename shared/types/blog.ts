/** Wpis spisu treści (nagłówek z id) */
export interface TocEntry {
  depth: number
  id: string
  text: string
}

/** Minimalne DTO postu do listy powiązanych (aside) */
export interface BlogPostRelatedDTO {
  slug: string
  title: string
  description?: string
  imageUrl?: string
  path: string
}

/** DTO pojedynczego postu (API response) */
export interface BlogPostDTO {
  id: number
  slug: string
  title: string
  description?: string
  bodyMd: string
  bodyHtml?: string
  toc?: TocEntry[]
  relatedPosts?: BlogPostRelatedDTO[]
  anchors?: BlogAnchorDTO[]
  imageUrl?: string
  publishedAt?: string
  authorId: number
  authorName?: string
  authorAvatar?: string
  tags: string[]
  seoTitle?: string
  seoDesc?: string
  createdAt: string
  updatedAt: string
}

/** Lista postów z paginacją */
export interface BlogListResponse {
  items: BlogPostDTO[]
  pagination: {
    page: number
    perPage: number
    total: number
  }
}

/** Query listy postów */
export interface BlogListQuery {
  page?: number
  perPage?: number
  search?: string
  tags?: string[]
  status?: 'published' | 'draft' | 'all'
}

/** Input tworzenia postu */
export type BlogPostCreateInput = {
  slug: string
  title: string
  description?: string
  bodyMd: string
  imageUrl?: string
  publishedAt?: string | null
  tags?: string[]
  anchors?: BlogAnchorInput[]
  seoTitle?: string
  seoDesc?: string
}

/** Input aktualizacji postu (partial) */
export type BlogPostUpdateInput = Partial<BlogPostCreateInput>

/** Tag blogowy (z bazy, do wyboru przy tworzeniu/edycji posta) */
export interface BlogTagDTO {
  id: number
  name: string
  createdAt?: string
}

/** Kotwica posta (link w aside) */
export interface BlogAnchorDTO {
  id: number
  blogPostId: number
  label: string
  to: string
  order: number
  icon?: string
  target?: string
  createdAt?: string
}

/** Input jednej kotwicy (create/update posta) */
export interface BlogAnchorInput {
  label: string
  to: string
  order?: number
  icon?: string
  target?: string
}
