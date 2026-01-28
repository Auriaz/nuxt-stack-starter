import { PrismaClient } from '../../prisma/generated/client.js'

/**
 * Singleton Prisma Client
 * Używa globalnego instancji w development, aby uniknąć wielu połączeń
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
