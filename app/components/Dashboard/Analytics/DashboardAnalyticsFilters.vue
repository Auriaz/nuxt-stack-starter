<script lang="ts" setup>
defineProps<{
  dateFrom: string
  dateTo: string
  period: '7d' | '30d'
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:dateFrom': [value: string]
  'update:dateTo': [value: string]
  'update:period': [value: '7d' | '30d']
  'apply': []
}>()

function setPreset(p: '7d' | '30d') {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - (p === '7d' ? 6 : 29))
  emit('update:dateFrom', from.toISOString().slice(0, 10))
  emit('update:dateTo', to.toISOString().slice(0, 10))
  emit('update:period', p)
  emit('apply')
}
</script>

<template>
  <div class="flex flex-wrap items-end gap-3">
    <div class="flex gap-2">
      <UButton
        size="sm"
        :color="period === '7d' ? 'primary' : 'neutral'"
        variant="soft"
        :disabled="loading"
        @click="setPreset('7d')"
      >
        Ostatnie 7 dni
      </UButton>
      <UButton
        size="sm"
        :color="period === '30d' ? 'primary' : 'neutral'"
        variant="soft"
        :disabled="loading"
        @click="setPreset('30d')"
      >
        Ostatnie 30 dni
      </UButton>
    </div>
    <div class="flex items-center gap-2">
      <UFormField label="Od">
        <UInput
          :model-value="dateFrom"
          type="date"
          size="sm"
          :disabled="loading"
          @update:model-value="(v) => { emit('update:dateFrom', v); emit('apply') }"
        />
      </UFormField>
      <UFormField label="Do">
        <UInput
          :model-value="dateTo"
          type="date"
          size="sm"
          :disabled="loading"
          @update:model-value="(v) => { emit('update:dateTo', v); emit('apply') }"
        />
      </UFormField>
    </div>
    <UButton
      size="sm"
      :loading="loading"
      @click="emit('apply')"
    >
      Zastosuj
    </UButton>
  </div>
</template>
