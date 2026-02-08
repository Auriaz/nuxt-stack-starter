/**
 * GET /api/blog/:slug — publiczny pojedynczy post (tylko opublikowane).
 * Dodaje bodyHtml, toc (spis treści) i relatedPosts (powiązane posty).
 */
import { getRouterParam } from 'h3'
import { getBlogPostBySlugUseCase } from '~~/domain/blog/getBlogPostBySlug.usecase'
import { blogPostRepository } from '~~/server/repositories/blogPost.repo'
import { mediaAssetRepository } from '~~/server/repositories/mediaAsset.repo'
import { DomainError } from '~~/domain/shared/errors'
import { renderMarkdownWithToc } from '~~/server/utils/markdown'
import type { BlogPostRelatedDTO } from '#shared/types/blog'

const RELATED_LIMIT = 4

function extractMediaId(url: string): string | null {
  const rawPath = url.startsWith('http')
    ? (() => {
        try {
          return new URL(url).pathname
        } catch {
          return url
        }
      })()
    : url
  const match = rawPath.match(/^\/api\/media\/([^/]+)\/serve/i)
  return match?.[1] ?? null
}

async function resolveImageUrl(url?: string | null): Promise<string | undefined> {
  if (!url) return undefined
  const mediaId = extractMediaId(url)
  if (!mediaId) return url
  const record = await mediaAssetRepository.findById(mediaId)
  return record ? url : undefined
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required'
    })
  }

  try {
    const post = await getBlogPostBySlugUseCase(
      { slug: slug.trim(), requirePublished: true },
      blogPostRepository
    )
    const { html: bodyHtml, toc } = renderMarkdownWithToc(post.bodyMd)
    const imageUrl = await resolveImageUrl(post.imageUrl)

    const { items } = await blogPostRepository.listPublic(
      {},
      { page: 1, perPage: RELATED_LIMIT + 5 }
    )
    const relatedCandidates = items
      .filter(p => p.slug !== post.slug)
      .slice(0, RELATED_LIMIT)
    const relatedPosts: BlogPostRelatedDTO[] = await Promise.all(
      relatedCandidates.map(async p => ({
        slug: p.slug,
        title: p.title,
        description: p.description ?? undefined,
        imageUrl: await resolveImageUrl(p.imageUrl ?? undefined),
        path: `/blog/${p.slug}`
      }))
    )

    return {
      data: {
        ...post,
        imageUrl,
        bodyHtml,
        toc,
        relatedPosts
      }
    }
  } catch (error) {
    if (error instanceof DomainError) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage: error.message,
        data: {
          error: {
            code: error.code,
            message: error.message,
            status: error.statusCode
          }
        }
      })
    }
    throw error
  }
})
