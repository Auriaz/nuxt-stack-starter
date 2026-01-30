<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Dashboard - Web Space',
  description: 'Panel administracyjny Web Space'
})

// TODO: Pobierz rzeczywiste statystyki z API
const stats = ref({
  portfolio: {
    total: 6,
    published: 4,
    draft: 2
  },
  blog: {
    total: 12,
    published: 10,
    draft: 2
  },
  services: {
    total: 7,
    active: 6,
    inactive: 1
  }
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Dashboard"
      icon="i-lucide-layout-dashboard"
    >
      <template #body>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <!-- Portfolio Stats -->
          <DashboardWidgetStats
            title="Portfolio"
            :value="stats.portfolio.total"
            icon="i-lucide-folder-kanban"
            :change="stats.portfolio.published"
            change-type="increase"
            color="primary"
          />

          <!-- Blog Stats -->
          <DashboardWidgetStats
            title="Blog"
            :value="stats.blog.total"
            icon="i-lucide-book-open"
            :change="stats.blog.published"
            change-type="increase"
            color="primary"
          />

          <!-- Services Stats -->
          <DashboardWidgetStats
            title="Usługi"
            :value="stats.services.total"
            icon="i-lucide-briefcase"
            :change="stats.services.active"
            change-type="increase"
            color="primary"
          />

          <!-- Drafts Stats -->
          <DashboardWidgetStats
            title="Szkice"
            :value="stats.portfolio.draft + stats.blog.draft"
            icon="i-lucide-file-edit"
            change-type="decrease"
            color="warning"
          />
        </div>

        <!-- Recent Activity -->
        <DashboardWidgetList
          title="Ostatnie aktywności"
          :items="[
            { label: 'Nowy projekt portfolio', value: '2 godziny temu', icon: 'i-lucide-folder-kanban', to: '/dashboard/portfolio' },
            { label: 'Opublikowano post', value: '5 godzin temu', icon: 'i-lucide-book-open', to: '/dashboard/blog' },
            { label: 'Zaktualizowano usługę', value: '1 dzień temu', icon: 'i-lucide-briefcase', to: '/dashboard/services' }
          ]"
        />
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
