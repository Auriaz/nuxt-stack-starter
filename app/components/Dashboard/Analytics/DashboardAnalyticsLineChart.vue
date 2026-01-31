<script lang="ts" setup>
import type { AnalyticsTimeSeriesDTO } from '#shared/types'

const props = defineProps<{
  data: AnalyticsTimeSeriesDTO | null
  loading?: boolean
  height?: number
}>()

const chartHeight = computed(() => props.height ?? 240)

/** Punkty do SVG: skaluje sessions i pageviews do wysokości wykresu. */
const chartPath = computed(() => {
  const points = props.data?.points ?? []
  if (points.length === 0) return ''

  const maxSessions = Math.max(1, ...points.map(p => p.sessions))
  const maxPageviews = Math.max(1, ...points.map(p => p.pageviews))
  const maxVal = Math.max(maxSessions, maxPageviews)
  const w = 100
  const h = 100
  const step = points.length > 1 ? w / (points.length - 1) : 0

  const sessionCoords = points.map((p, i) => `${(i * step).toFixed(2)},${(h - (p.sessions / maxVal) * h).toFixed(2)}`)
  return `M ${sessionCoords.join(' L ')}`
})

const pageviewsPath = computed(() => {
  const points = props.data?.points ?? []
  if (points.length === 0) return ''

  const maxSessions = Math.max(1, ...points.map(p => p.sessions))
  const maxPageviews = Math.max(1, ...points.map(p => p.pageviews))
  const maxVal = Math.max(maxSessions, maxPageviews)
  const w = 100
  const h = 100
  const step = points.length > 1 ? w / (points.length - 1) : 0

  const coords = points.map((p, i) => `${(i * step).toFixed(2)},${(h - (p.pageviews / maxVal) * h).toFixed(2)}`)
  return `M ${coords.join(' L ')}`
})

const labels = computed(() => {
  const points = props.data?.points ?? []
  return points.map((p) => {
    const d = p.date
    return d.length >= 10 ? d.slice(5, 10) : d
  })
})
</script>

<template>
  <UCard class="glass-panel cockpit-panel relative overflow-hidden">
    <div class="cockpit-hud-corners" />
    <template #header>
      <h3 class="text-lg font-semibold">
        Trend (sesje i odsłony)
      </h3>
    </template>
    <div
      v-if="loading"
      class="flex items-center justify-center text-muted"
      :style="{ height: `${chartHeight}px` }"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="size-8 animate-spin"
      />
    </div>
    <div
      v-else-if="!data?.points?.length"
      class="flex flex-col items-center justify-center gap-2 text-muted"
      :style="{ height: `${chartHeight}px` }"
    >
      <UIcon
        name="i-lucide-bar-chart-3"
        class="size-12"
      />
      <p class="text-sm">
        Brak danych w wybranym okresie
      </p>
    </div>
    <div
      v-else
      class="relative"
      :style="{ height: `${chartHeight}px` }"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        class="absolute inset-0 size-full"
      >
        <path
          :d="chartPath"
          fill="none"
          stroke="var(--color-primary-500)"
          stroke-width="0.5"
          vector-effect="non-scaling-stroke"
        />
        <path
          :d="pageviewsPath"
          fill="none"
          stroke="var(--color-primary-400)"
          stroke-width="0.5"
          stroke-dasharray="1 1"
          vector-effect="non-scaling-stroke"
        />
      </svg>
      <div class="absolute bottom-0 left-0 right-0 flex justify-between gap-1 px-1 text-[10px] text-muted">
        <span
          v-for="(label, i) in labels"
          :key="i"
          class="truncate"
        >
          {{ label }}
        </span>
      </div>
    </div>
    <div class="mt-2 flex gap-4 text-xs text-muted">
      <span class="flex items-center gap-1">
        <span class="inline-block size-2 rounded-full bg-primary-500" />
        Sesje
      </span>
      <span class="flex items-center gap-1">
        <span class="inline-block size-2 rounded-full border border-primary-400 border-dashed bg-transparent" />
        Odsłony
      </span>
    </div>
  </UCard>
</template>
