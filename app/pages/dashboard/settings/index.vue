<script lang="ts" setup>
import type { SettingsDTO } from '#shared/types'
import { useSettingsResource } from '~/composables/resources/useSettingsResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

useSeoMeta({
  title: 'Ustawienia - Dashboard',
  description: 'Ustawienia konta: język, powiadomienia, prywatność, wygląd, integracje'
})

const route = useRoute()
const router = useRouter()
const settingsResource = useSettingsResource()

const settings = useState<SettingsDTO | null>('dashboard-settings', () => null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const tabs = ref([
  { id: 'general', label: 'Ogólne', icon: 'i-heroicons-globe-alt' },
  { id: 'notifications', label: 'Powiadomienia', icon: 'i-heroicons-bell' },
  { id: 'privacy', label: 'Prywatność', icon: 'i-heroicons-lock-closed' },
  { id: 'security', label: 'Bezpieczeństwo', icon: 'i-heroicons-shield-check' },
  { id: 'appearance', label: 'Wygląd', icon: 'i-heroicons-paint-brush' },
  { id: 'integrations', label: 'Integracje', icon: 'i-heroicons-puzzle-piece' }
])

const VALID_TAB_IDS = ['general', 'notifications', 'privacy', 'security', 'appearance', 'integrations']

function getTabFromQuery(): string {
  const tabParam = route.query.tab as string | undefined
  if (tabParam && VALID_TAB_IDS.includes(tabParam)) return tabParam
  return 'general'
}

const activeTab = ref(getTabFromQuery())

/** Kolor Nuxt UI dla aktywnej zakładki (primary | success | warning | error | info) */
function getTabColor(tabId: string): 'primary' | 'success' | 'warning' | 'error' | 'info' {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
    general: 'primary',
    notifications: 'success',
    privacy: 'warning',
    security: 'error',
    appearance: 'info',
    integrations: 'info'
  }
  return colors[tabId] ?? 'primary'
}

function setActiveTab(id: string) {
  activeTab.value = id
}

watch(() => route.query.tab, (newTab) => {
  if (newTab && typeof newTab === 'string' && VALID_TAB_IDS.includes(newTab)) {
    activeTab.value = newTab
  }
}, { immediate: true })

watch(activeTab, (newTab) => {
  if (route.query.tab !== newTab) {
    router.replace({
      query: { ...route.query, tab: newTab }
    })
  }
})

async function fetchSettings() {
  isLoading.value = true
  loadError.value = null
  try {
    const data = await settingsResource.getMySettings()
    settings.value = data
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Nie udało się pobrać ustawień'
  } finally {
    isLoading.value = false
  }
}

function onSettingsUpdated(data: SettingsDTO) {
  settings.value = data
}

onMounted(() => {
  fetchSettings()
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Ustawienia"
      icon="i-lucide-settings"
    >
      <template #body>
        <div class="space-y-8 p-4 sm:p-6 lg:p-8">
          <p class="text-sm text-neutral-600 dark:text-neutral-400">
            Zarządzaj językiem, powiadomieniami, prywatnością, wyglądem i połączeniami.
          </p>

          <UCard
            v-if="loadError"
            variant="soft"
            color="error"
            class="rounded-lg"
          >
            <template #title>
              Błąd ładowania
            </template>
            <p class="text-sm">
              {{ loadError }}
            </p>
            <template #footer>
              <UButton
                size="sm"
                color="error"
                variant="soft"
                @click="fetchSettings"
              >
                Spróbuj ponownie
              </UButton>
            </template>
          </UCard>

          <UCard
            v-else
            variant="soft"
            padding="none"
            class="overflow-hidden"
          >
            <nav class="flex flex-wrap sm:flex-nowrap">
              <UButton
                v-for="tab in tabs"
                :key="tab.id"
                :variant="activeTab === tab.id ? 'solid' : 'ghost'"
                :color="activeTab === tab.id ? getTabColor(tab.id) : 'secondary'"
                :class="[
                  'flex flex-1 items-center gap-2 whitespace-nowrap rounded-none border-0 px-4 py-3 text-sm font-medium transition-all duration-300 sm:flex-none sm:px-6 sm:py-4',
                  activeTab === tab.id
                    ? 'scale-[1.02] shadow-md'
                    : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
                ]"
                @click="setActiveTab(tab.id)"
              >
                <UIcon
                  :name="tab.icon"
                  class="h-4 w-4 shrink-0"
                />
                <span class="hidden sm:inline">{{ tab.label }}</span>
              </UButton>
            </nav>
          </UCard>

          <!-- Tab content -->
          <template v-if="isLoading">
            <div
              v-for="tab in tabs"
              :key="tab.id"
              class="space-y-4"
            >
              <USkeleton class="h-10 w-48" />
              <USkeleton class="h-24 w-full" />
              <USkeleton class="h-24 w-full" />
            </div>
          </template>
          <template v-else>
            <DashboardSettingsGeneral
              v-show="activeTab === 'general'"
              v-motion-fade
              :settings="settings"
              @updated="onSettingsUpdated"
            />
            <DashboardSettingsNotifications
              v-show="activeTab === 'notifications'"
              v-motion-fade
              :settings="settings"
              @updated="onSettingsUpdated"
            />
            <DashboardSettingsPrivacy
              v-show="activeTab === 'privacy'"
              v-motion-fade
              :settings="settings"
              @updated="onSettingsUpdated"
            />
            <DashboardSettingsSecurity
              v-show="activeTab === 'security'"
              v-motion-fade
            />
            <DashboardSettingsAppearance
              v-show="activeTab === 'appearance'"
              v-motion-fade
              :settings="settings"
              @updated="onSettingsUpdated"
            />
            <DashboardSettingsIntegrations
              v-show="activeTab === 'integrations'"
              v-motion-fade
              :settings="settings"
              @updated="onSettingsUpdated"
            />
          </template>
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
