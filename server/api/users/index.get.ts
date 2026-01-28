import { safeParse, array } from 'valibot'
import { UserOutputSchema } from '#shared/schemas/api'

/**
 * GET /api/users
 *
 * Zwraca listę wszystkich użytkowników.
 * Prosty CRUD - bezpośrednio Prisma, bez domain layer.
 */
export default defineEventHandler(async () => {
  // Prosty CRUD - bezpośrednio Prisma, bez domain
  const users = await prisma.user.findMany()

  // Mapowanie Prisma → DTO (konwersja DateTime na ISO string)
  const usersDto = users.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  }))

  // Walidacja outputu (opcjonalnie, dla spójności)
  const result = safeParse(array(UserOutputSchema), usersDto)
  if (!result.success) {
    throw createError({
      status: 500,
      statusText: 'Output validation failed',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Output validation failed',
          issues: result.issues
        }
      }
    })
  }

  return { data: result.output }
})
