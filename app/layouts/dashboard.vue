<script lang="ts" setup>
import { useDashboardSearch } from '~/composables/useDashboardSearch'
import { useChatStore } from '~/stores/chat'

const { groups, searchTerm, chatLoading } = useDashboardSearch()
const chatStore = useChatStore()
const { isLoggedIn } = useAuth()

onMounted(() => {
  if (isLoggedIn.value) {
    chatStore.ensureRealtime()
  }
})
</script>

<template>
  <UDashboardGroup
    storage="cookie"
    storage-key="dashboard"
    :persistent="true"
  >
    <!-- Sidebar -->
    <DashboardSidebar />
    <!-- Global Search -->
    <UDashboardSearch
      v-model:search-term="searchTerm"
      :groups="groups"
      :loading="chatLoading"
      shortcut="meta_k"
      :color-mode="true"
    />
    <!-- Main Content -->
    <slot />
    <ChatDrawer />
  </UDashboardGroup>
</template>
