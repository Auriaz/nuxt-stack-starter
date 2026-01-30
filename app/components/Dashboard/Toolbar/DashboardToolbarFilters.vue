<script lang="ts" setup>
import type { DashboardFiltersValue } from '#shared/types'

export interface Filter {
  key: string
  label: string
  type: 'select' | 'date' | 'search'
  options?: Array<{ label: string, value: string }>
  placeholder?: string
}

const props = defineProps<{
  filters: Filter[]
  modelValue: DashboardFiltersValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DashboardFiltersValue]
}>()

function normalizeFilterValue(value: unknown): string | number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === 'string' || typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  return String(value)
}

const updateFilter = (key: string, value: unknown) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [key]: normalizeFilterValue(value)
  })
}
</script>

<template>
  <div class="flex items-center gap-2">
    <template
      v-for="filter in filters"
      :key="filter.key"
    >
      <USelect
        v-if="filter.type === 'select'"
        :model-value="modelValue[filter.key]"
        :options="filter.options || []"
        :placeholder="filter.placeholder || filter.label"
        class="w-48"
        @update:model-value="updateFilter(filter.key, $event)"
      />

      <UInput
        v-else-if="filter.type === 'search'"
        :model-value="modelValue[filter.key]"
        :placeholder="filter.placeholder || filter.label"
        icon="i-lucide-search"
        class="w-64"
        @update:model-value="updateFilter(filter.key, $event)"
      />

      <UInput
        v-else-if="filter.type === 'date'"
        :model-value="modelValue[filter.key]"
        type="date"
        :placeholder="filter.placeholder || filter.label"
        class="w-48"
        @update:model-value="updateFilter(filter.key, $event)"
      />
    </template>
  </div>
</template>
