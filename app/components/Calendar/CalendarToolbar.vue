<script lang="ts" setup>
const props = defineProps<{
  selectedYear: number
  selectedMonth: number
  selectedDay: number
  yearItems: Array<{ label: string, value: number }>
  monthItems: Array<{ label: string, value: number }>
  dayItems: Array<{ label: string, value: number }>
}>()

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'update:selectedYear' | 'update:selectedMonth' | 'update:selectedDay', value: number): void
}>()

const selectedYearProxy = computed({
  get: () => props.selectedYear,
  set: value => emit('update:selectedYear', value)
})

const selectedMonthProxy = computed({
  get: () => props.selectedMonth,
  set: value => emit('update:selectedMonth', value)
})

const selectedDayProxy = computed({
  get: () => props.selectedDay,
  set: value => emit('update:selectedDay', value)
})
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 mb-4">
    <UButton
      color="primary"
      icon="i-lucide-plus"
      @click="emit('create')"
    >
      Nowe wydarzenie
    </UButton>

    <USelect
      v-model="selectedYearProxy"
      :items="yearItems"
      size="sm"
      color="neutral"
    />

    <USelect
      v-model="selectedMonthProxy"
      :items="monthItems"
      size="sm"
      color="neutral"
    />

    <USelect
      v-model="selectedDayProxy"
      :items="dayItems"
      size="sm"
      color="neutral"
    />
  </div>
</template>
