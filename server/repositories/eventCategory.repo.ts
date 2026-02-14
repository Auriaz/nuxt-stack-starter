import { prisma } from '../services/prisma'

export interface EventCategoryRecord {
  id: number
  userId: number | null
  teamId: number | null
  label: string
  slug: string
  description: string | null
  color: string
  icon: string
  isSystem: boolean
  isDefault: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface EventCategoryCreateInput {
  userId?: number | null
  teamId?: number | null
  label: string
  slug: string
  description?: string | null
  color: string
  icon: string
  isSystem?: boolean
  isDefault?: boolean
  sortOrder?: number
}

export interface EventCategoryUpdateInput {
  label?: string
  slug?: string
  description?: string | null
  color?: string
  icon?: string
  isDefault?: boolean
  sortOrder?: number
}

export interface EventCategoryRepository {
  findById(categoryId: number): Promise<EventCategoryRecord | null>
  findBySlug(slug: string, scope: { userId?: number | null, teamId?: number | null }): Promise<EventCategoryRecord | null>
  list(filter: {
    userId?: number | null
    teamId?: number | null
    isSystem?: boolean
  }): Promise<EventCategoryRecord[]>
  create(input: EventCategoryCreateInput): Promise<EventCategoryRecord>
  update(categoryId: number, data: EventCategoryUpdateInput): Promise<EventCategoryRecord>
  delete(categoryId: number): Promise<void>
  countBySlug(slug: string, scope: { userId?: number | null, teamId?: number | null }, excludeId?: number): Promise<number>
  findDefaultForScope(scope: { userId?: number | null, teamId?: number | null }): Promise<EventCategoryRecord | null>
}

const getEventCategoryModel = () => {
  const client = prisma as unknown as {
    eventCategory: {
      findUnique: (args: unknown) => Promise<EventCategoryRecord | null>
      findMany: (args: unknown) => Promise<EventCategoryRecord[]>
      findFirst: (args: unknown) => Promise<EventCategoryRecord | null>
      create: (args: unknown) => Promise<EventCategoryRecord>
      update: (args: unknown) => Promise<EventCategoryRecord>
      delete: (args: unknown) => Promise<EventCategoryRecord>
      count: (args: unknown) => Promise<number>
    }
  }
  return client.eventCategory
}

export function createEventCategoryRepository(): EventCategoryRepository {
  return {
    async findById(categoryId: number): Promise<EventCategoryRecord | null> {
      const model = getEventCategoryModel()
      return model.findUnique({ where: { id: categoryId } })
    },

    async findBySlug(slug: string, scope: { userId?: number | null, teamId?: number | null }): Promise<EventCategoryRecord | null> {
      const model = getEventCategoryModel()
      return model.findFirst({
        where: {
          slug,
          userId: scope.userId ?? null,
          teamId: scope.teamId ?? null
        }
      })
    },

    async list(filter: {
      userId?: number | null
      teamId?: number | null
      isSystem?: boolean
    }): Promise<EventCategoryRecord[]> {
      const model = getEventCategoryModel()
      const where: Record<string, unknown> = {}

      if (filter.userId !== undefined) {
        where.userId = filter.userId
      }
      if (filter.teamId !== undefined) {
        where.teamId = filter.teamId
      }
      if (filter.isSystem !== undefined) {
        where.isSystem = filter.isSystem
      }

      return model.findMany({
        where,
        orderBy: [
          { sortOrder: 'asc' },
          { label: 'asc' }
        ]
      })
    },

    async create(input: EventCategoryCreateInput): Promise<EventCategoryRecord> {
      const model = getEventCategoryModel()
      return model.create({
        data: {
          userId: input.userId ?? null,
          teamId: input.teamId ?? null,
          label: input.label,
          slug: input.slug,
          description: input.description ?? null,
          color: input.color,
          icon: input.icon,
          isSystem: input.isSystem ?? false,
          isDefault: input.isDefault ?? false,
          sortOrder: input.sortOrder ?? 0
        }
      })
    },

    async update(categoryId: number, data: EventCategoryUpdateInput): Promise<EventCategoryRecord> {
      const model = getEventCategoryModel()
      return model.update({
        where: { id: categoryId },
        data
      })
    },

    async delete(categoryId: number): Promise<void> {
      const model = getEventCategoryModel()
      await model.delete({ where: { id: categoryId } })
    },

    async countBySlug(slug: string, scope: { userId?: number | null, teamId?: number | null }, excludeId?: number): Promise<number> {
      const model = getEventCategoryModel()
      const where: Record<string, unknown> = {
        slug,
        userId: scope.userId ?? null,
        teamId: scope.teamId ?? null
      }

      if (excludeId) {
        where.NOT = { id: excludeId }
      }

      return model.count({ where })
    },

    async findDefaultForScope(scope: { userId?: number | null, teamId?: number | null }): Promise<EventCategoryRecord | null> {
      const model = getEventCategoryModel()
      return model.findFirst({
        where: {
          userId: scope.userId ?? null,
          teamId: scope.teamId ?? null,
          isDefault: true
        }
      })
    }
  }
}
