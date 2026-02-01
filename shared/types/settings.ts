import type { InferOutput } from 'valibot'
import type { SettingsOutputSchema, SettingsUpdateSchema } from '../schemas/settings'

export type SettingsDTO = InferOutput<typeof SettingsOutputSchema>
export type SettingsUpdateInput = InferOutput<typeof SettingsUpdateSchema>
