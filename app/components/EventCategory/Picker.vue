<script lang="ts" setup>
import type { EventCategoryDTO } from '#shared/types/event-category'

const props = defineProps<{
  categories: EventCategoryDTO[]
  modelValue?: number | null
  placeholder?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const selectedCategoryId = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value)
})

const categoryItems = computed(() => {
  return props.categories.map(cat => ({
    label: cat.label,
    value: cat.id,
    icon: cat.icon,
    color: cat.color
  }))
})

const selectedCategory = computed(() => {
  if (!selectedCategoryId.value) return null
  return props.categories.find(c => c.id === selectedCategoryId.value) ?? null
})
</script>

<template>
  <div class="w-full">
    <USelect
      v-model="selectedCategoryId"
      :items="categoryItems"
      :placeholder="placeholder || 'Wybierz kategorię'"
      :disabled="disabled"
      class="w-full"
    >
      <template #label>
        <EventCategoryBadge
          v-if="selectedCategory"
          :category="selectedCategory"
          size="sm"
        />
        <span
          v-else
          class="text-gray-500"
        >{{ placeholder || 'Wybierz kategorię' }}</span>
      </template>

      <template #option="{ option }">
        <div class="flex items-center gap-2">
          <UIcon
            :name="option.icon"
            :style="{ color: option.color }"
          />
          <span>{{ option.label }}</span>
        </div>
      </template>
    </USelect>
  </div>
</template>
