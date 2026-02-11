<script lang="ts" setup>
import type { CalendarViewMode } from '~/composables/useCalendarView'

defineProps<{
  modelValue: CalendarViewMode
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CalendarViewMode): void
}>()

const tabs = [
  { id: 'year', label: 'Rok', icon: 'i-lucide-calendar' },
  { id: 'month', label: 'Miesiac', icon: 'i-lucide-calendar-days' },
  { id: 'week', label: 'Tydzien', icon: 'i-lucide-calendar-range' },
  { id: 'day', label: 'Dzien', icon: 'i-lucide-calendar-check-2' },
  { id: 'schedule', label: 'Harmonogram', icon: 'i-lucide-list' },
  { id: 'four-day', label: '4 dni', icon: 'i-lucide-columns-3' }
] as const

function setActive(id: CalendarViewMode) {
  emit('update:modelValue', id)
}
</script>

<template>
  <UCard
    variant="soft"
    padding="none"
    class="overflow-hidden"
  >
    <nav class="flex flex-wrap sm:flex-nowrap">
      <UButton
        v-for="tab in tabs"
        :key="tab.id"
        :variant="modelValue === tab.id ? 'solid' : 'ghost'"
        :color="modelValue === tab.id ? 'primary' : 'secondary'"
        :class="[
          'flex flex-1 items-center gap-2 whitespace-nowrap rounded-none border-0 px-4 py-3 text-sm font-medium transition-all duration-300 sm:flex-none sm:px-6 sm:py-4',
          modelValue === tab.id
            ? 'scale-[1.01] shadow-sm'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
        ]"
        @click="setActive(tab.id)"
      >
        <UIcon
          :name="tab.icon"
          class="h-4 w-4 shrink-0"
        />
        <span class="hidden sm:inline">{{ tab.label }}</span>
      </UButton>
    </nav>
  </UCard>
</template>
