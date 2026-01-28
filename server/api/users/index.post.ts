import { safeParse } from 'valibot'
import { CreateUserInputSchema, UserOutputSchema } from '#shared/schemas/api'

/**
 * POST /api/users
 *
 * Tworzy nowego użytkownika.
 * Prosty CRUD - bezpośrednio Prisma, bez domain layer.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Walidacja inputu
  const inputResult = safeParse(CreateUserInputSchema, body)
  if (!inputResult.success) {
    throw createError({
      status: 400,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Input validation failed',
          issues: inputResult.issues
        }
      }
    })
  }

  try {
    // Prosty CRUD - bezpośrednio Prisma
    const user = await prisma.user.create({
      data: {
        username: inputResult.output.username,
        email: inputResult.output.email
      }
    })

    // Mapowanie Prisma → DTO (konwersja DateTime na ISO string)
    const userDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }

    // Walidacja outputu
    const outputResult = safeParse(UserOutputSchema, userDto)
    if (!outputResult.success) {
      throw createError({
        status: 500,
        statusText: 'Output validation failed',
        data: {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Output validation failed',
            issues: outputResult.issues
          }
        }
      })
    }

    return { data: outputResult.output }
  } catch (error) {
    // Obsługa błędów Prisma (np. unique constraint violation)
    if ((error as { code?: string }).code === 'P2002') {
      throw createError({
        status: 409,
        statusText: 'Conflict',
        data: {
          error: {
            code: 'DUPLICATE_ERROR',
            message: 'User with this username or email already exists'
          }
        }
      })
    }

    throw createError({
      status: 500,
      statusText: 'Internal server error',
      data: {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create user'
        }
      }
    })
  }
})
