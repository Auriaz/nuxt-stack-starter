<script lang="ts" setup>
import { PERMISSIONS } from '#shared/permissions'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Analityka - Dashboard',
  description: 'Przegląd analityki (GA4)'
})

const { can } = useAccess()
const config = useRuntimeConfig()

const {
  overview,
  topPages,
  sources,
  trend,
  dateFrom,
  dateTo,
  period,
  isLoading,
  error,
  initDateRange,
  fetchAll
} = useAnalytics()

function onDateFromUpdate(v: string) {
  dateFrom.value = v
}

function onDateToUpdate(v: string) {
  dateTo.value = v
}

function onPeriodUpdate(v: '7d' | '30d') {
  period.value = v
}

function onApply() {
  fetchAll()
}

/** Czy dane są załadowane, ale wszystkie puste (brak GA4 lub brak ruchu w okresie). */
const isEmptyState = computed(() => {
  if (isLoading.value) return false
  const o = overview.value
  const hasOverview = o && (o.users > 0 || o.sessions > 0 || o.pageviews > 0)
  const hasTrend = (trend.value?.points?.length ?? 0) > 0
  const hasPages = (topPages.value?.length ?? 0) > 0
  const hasSources = (sources.value?.length ?? 0) > 0
  return !hasOverview && !hasTrend && !hasPages && !hasSources && (o !== null || topPages.value !== null)
})

onMounted(() => {
  if (!config.public.analyticsEnabled || !can(PERMISSIONS.ANALYTICS_READ)) {
    navigateTo('/dashboard')
    return
  }
  initDateRange()
  fetchAll()
})
</script>

<template>
  <NuxtLayout>
    <DashboardPanel
      title="Analityka"
      icon="i-lucide-bar-chart-3"
    >
      <template #sidebar>
        <DashboardAnalyticsFilters
          :date-from="dateFrom"
          :date-to="dateTo"
          :period="period"
          :loading="isLoading"
          @update:date-from="onDateFromUpdate"
          @update:date-to="onDateToUpdate"
          @update:period="onPeriodUpdate"
          @apply="onApply"
        />
      </template>

      <template #body>
        <div class="space-y-6">
          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="error"
            class="rounded-lg"
          >
            <template #actions>
              <UButton
                size="xs"
                color="error"
                variant="soft"
                @click="fetchAll()"
              >
                Spróbuj ponownie
              </UButton>
            </template>
          </UAlert>

          <UAlert
            v-else-if="isEmptyState"
            color="primary"
            variant="soft"
            title="Brak danych z Google Analytics"
            description="Skonfiguruj GA4 w .env (GA_PROPERTY_ID, GA_CLIENT_EMAIL, GA_PRIVATE_KEY; opcjonalnie ANALYTICS_ENABLED=true). W Google Cloud utwórz Service Account, w GA4 nadaj mu rolę „Przeglądający”. Na produkcji dane pojawią się po zebraniu ruchu."
            class="rounded-lg"
          />

          <div class="grid gap-4 sm:grid-cols-3">
            <div
              v-motion-fade
              class="duration-300"
            >
              <DashboardAnalyticsKpiCard
                label="Użytkownicy"
                :value="overview?.users ?? 0"
                icon="i-lucide-users"
                :loading="isLoading"
              />
            </div>
            <div
              v-motion-fade
              class="duration-300"
              :delay="50"
            >
              <DashboardAnalyticsKpiCard
                label="Sesje"
                :value="overview?.sessions ?? 0"
                icon="i-lucide-activity"
                :loading="isLoading"
              />
            </div>
            <div
              v-motion-fade
              class="duration-300"
              :delay="100"
            >
              <DashboardAnalyticsKpiCard
                label="Odsłony"
                :value="overview?.pageviews ?? 0"
                icon="i-lucide-eye"
                :loading="isLoading"
              />
            </div>
          </div>

          <div
            v-motion-fade
            class="duration-300"
            :delay="150"
          >
            <DashboardAnalyticsLineChart
              :data="trend ? { points: [...trend.points] } : null"
              :loading="isLoading"
              :height="260"
            />
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <div
              v-motion-fade
              class="duration-300"
              :delay="200"
            >
              <DashboardAnalyticsTable
                variant="pages"
                :items="topPages ? [...topPages] : null"
                :loading="isLoading"
              />
            </div>
            <div
              v-motion-fade
              class="duration-300"
              :delay="250"
            >
              <DashboardAnalyticsTable
                variant="sources"
                :items="sources ? [...sources] : null"
                :loading="isLoading"
              />
            </div>
          </div>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
