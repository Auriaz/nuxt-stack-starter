<script lang="ts" setup>
import type { ChartData } from '#shared/types'

defineProps<{
  title: string
  data: ChartData
  type?: 'line' | 'bar' | 'pie'
}>()
</script>

<template>
  <DashboardWidget :title="title">
    <div class="p-6">
      <!-- TODO: Integracja z biblioteką wykresów (Chart.js, Recharts, etc.) -->
      <div class="flex items-center justify-center h-64 text-muted">
        <div class="text-center">
          <UIcon
            name="i-lucide-bar-chart"
            class="w-12 h-12 mb-2 mx-auto"
          />
          <p class="text-sm">
            Wykres będzie dostępny po integracji z biblioteką wykresów
          </p>
        </div>
      </div>
    </div>
  </DashboardWidget>
</template>
