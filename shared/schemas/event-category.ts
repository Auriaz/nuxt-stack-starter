import * as v from 'valibot'

/**
 * Schema dla tworzenia kategorii zdarzeń
 */
export const CreateEventCategoryInputSchema = v.object({
  label: v.pipe(
    v.string('Label jest wymagany'),
    v.minLength(1, 'Label nie może być pusty'),
    v.maxLength(50, 'Label może mieć maksymalnie 50 znaków')
  ),
  slug: v.pipe(
    v.string('Slug jest wymagany'),
    v.regex(/^[a-z0-9-]+$/, 'Slug może zawierać tylko małe litery, cyfry i myślniki'),
    v.maxLength(50, 'Slug może mieć maksymalnie 50 znaków')
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.maxLength(500, 'Opis może mieć maksymalnie 500 znaków')
    )
  ),
  color: v.pipe(
    v.string('Kolor jest wymagany'),
    v.regex(/^#[0-9a-f]{6}$/i, 'Kolor musi być w formacie hex (#RRGGBB)')
  ),
  icon: v.pipe(
    v.string('Ikona jest wymagana'),
    v.minLength(1, 'Ikona nie może być pusta'),
    v.maxLength(100, 'Ikona może mieć maksymalnie 100 znaków')
  ),
  isSystem: v.optional(v.boolean('isSystem musi być boolean')),
  teamId: v.optional(v.number('Team ID musi być liczbą')),
  isDefault: v.optional(v.boolean('isDefault musi być boolean')),
  sortOrder: v.optional(v.number('sortOrder musi być liczbą'))
})

/**
 * Schema dla aktualizacji kategorii zdarzeń (wszystkie pola opcjonalne)
 */
export const UpdateEventCategoryInputSchema = v.partial(CreateEventCategoryInputSchema)

/**
 * Schema dla scope kategorii (filtrowanie)
 */
export const EventCategoryScopeSchema = v.picklist(
  ['personal', 'team', 'all', 'system'],
  'Scope musi być: personal, team, all lub system'
)

/**
 * Schema dla query parametrów listy kategorii
 */
export const ListEventCategoriesQuerySchema = v.object({
  scope: v.optional(EventCategoryScopeSchema),
  teamId: v.optional(v.pipe(v.string(), v.transform(Number)))
})
