import type { BlogPostDTO, BlogAnchorDTO } from '#shared/types/blog'

export interface BlogPostRecord {
  id: number
  slug: string
  title: string
  description: string | null
  bodyMd: string
  imageUrl: string | null
  publishedAt: Date | null
  authorId: number
  tags: string[]
  seoTitle: string | null
  seoDesc: string | null
  createdAt: Date
  updatedAt: Date
}

export interface BlogAnchorRecord {
  id: number
  blogPostId: number
  label: string
  to: string
  order: number
  icon: string | null
  target: string | null
  createdAt: Date
}

export interface BlogPostRecordWithAuthor extends BlogPostRecord {
  author: {
    id: number
    name: string | null
    avatarUrl: string | null
  }
  anchors?: BlogAnchorRecord[]
}

function toBlogAnchorDTO(anchor: BlogAnchorRecord): BlogAnchorDTO {
  return {
    id: anchor.id,
    blogPostId: anchor.blogPostId,
    label: anchor.label,
    to: anchor.to,
    order: anchor.order,
    icon: anchor.icon ?? undefined,
    target: anchor.target ?? undefined,
    createdAt: anchor.createdAt.toISOString()
  }
}

export function toBlogPostDTO(
  record: BlogPostRecordWithAuthor | BlogPostRecord,
  options?: { includeBodyHtml?: boolean }
): BlogPostDTO {
  const withAuthor = 'author' in record ? record : null
  const withAnchors = withAuthor && 'anchors' in withAuthor && Array.isArray(withAuthor.anchors)
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description ?? undefined,
    bodyMd: record.bodyMd,
    ...(options?.includeBodyHtml && { bodyHtml: undefined }),
    imageUrl: record.imageUrl ?? undefined,
    publishedAt: record.publishedAt?.toISOString(),
    authorId: record.authorId,
    authorName: withAuthor?.author?.name ?? undefined,
    authorAvatar: withAuthor?.author?.avatarUrl ?? undefined,
    tags: record.tags,
    ...(withAnchors && { anchors: (withAuthor as BlogPostRecordWithAuthor).anchors!.map(toBlogAnchorDTO) }),
    seoTitle: record.seoTitle ?? undefined,
    seoDesc: record.seoDesc ?? undefined,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  }
}
