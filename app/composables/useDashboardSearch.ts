import { useDebounce } from '@vueuse/core'
import type { CommandPaletteGroup } from '@nuxt/ui'
import { useChatStore } from '~/stores/chat'

type ChatSearchItem = {
  message_id: number
  thread_id: number
  thread_title?: string | null
  thread_type?: string | null
  snippet: string
  created_at: string
}

export const useDashboardSearch = () => {
  const chatStore = useChatStore()
  const searchTerm = ref('')
  const debouncedTerm = useDebounce(searchTerm, 250)
  const chatResults = ref<ChatSearchItem[]>([])
  const chatLoading = ref(false)
  let requestId = 0

  watch(debouncedTerm, async (term) => {
    if (import.meta.server) return
    const trimmed = term.trim()
    if (trimmed.length < 2) {
      chatResults.value = []
      chatLoading.value = false
      return
    }

    const currentRequest = ++requestId
    chatLoading.value = true
    try {
      const data = await $fetch<{ items: ChatSearchItem[] }>('/api/chat/search', {
        query: { q: trimmed, limit: 20 }
      })
      if (currentRequest !== requestId) return
      chatResults.value = data.items ?? []
    } catch {
      if (currentRequest !== requestId) return
      chatResults.value = []
    } finally {
      if (currentRequest === requestId) {
        chatLoading.value = false
      }
    }
  })

  const groups = computed<CommandPaletteGroup[]>(() => {
    const items: CommandPaletteGroup[] = [
      {
        id: 'portfolio',
        label: 'Portfolio',
        items: [
          {
            label: 'Wszystkie projekty',
            icon: 'i-lucide-grid',
            to: '/dashboard/portfolio',
            description: 'Zarządzaj wszystkimi projektami portfolio'
          },
          {
            label: 'Dodaj projekt',
            icon: 'i-lucide-plus',
            to: '/dashboard/portfolio/create',
            description: 'Utwórz nowy projekt portfolio'
          }
        ]
      },
      {
        id: 'blog',
        label: 'Blog',
        items: [
          {
            label: 'Wszystkie posty',
            icon: 'i-lucide-file-text',
            to: '/dashboard/blog',
            description: 'Zarządzaj wszystkimi postami blogowymi'
          },
          {
            label: 'Dodaj post',
            icon: 'i-lucide-plus',
            to: '/dashboard/blog/create',
            description: 'Utwórz nowy post blogowy'
          }
        ]
      },
      {
        id: 'services',
        label: 'Usługi',
        items: [
          {
            label: 'Wszystkie usługi',
            icon: 'i-lucide-list',
            to: '/dashboard/services',
            description: 'Zarządzaj wszystkimi usługami'
          }
        ]
      },
      {
        id: 'settings',
        label: 'Ustawienia',
        items: [
          {
            label: 'Ustawienia ogólne',
            icon: 'i-lucide-settings',
            to: '/dashboard/settings',
            description: 'Zarządzaj ustawieniami aplikacji'
          },
          {
            label: 'Profil',
            icon: 'i-lucide-user',
            to: '/dashboard/profile',
            description: 'Edytuj swój profil użytkownika'
          },
          {
            label: 'Zespół',
            icon: 'i-lucide-users',
            to: '/dashboard/settings/team',
            description: 'Zarządzaj zespołem użytkowników'
          }
        ]
      },
      {
        id: 'navigation',
        label: 'Nawigacja',
        items: [
          {
            label: 'Dashboard',
            icon: 'i-lucide-layout-dashboard',
            to: '/dashboard',
            description: 'Strona główna dashboardu'
          },
          {
            label: 'Analytics',
            icon: 'i-lucide-bar-chart',
            to: '/dashboard/analytics',
            description: 'Statystyki i analityka'
          }
        ]
      }
    ]

    if (chatStore.threads.length) {
      items.splice(2, 0, {
        id: 'chat',
        label: 'Czat',
        items: chatStore.threads.map(thread => ({
          label: thread.title || (thread.type === 'ai' ? 'Czat AI' : `Watek ${thread.id}`),
          icon: 'i-lucide-message-square',
          to: `/dashboard/chat?thread=${thread.id}`,
          description: thread.type === 'ai' ? 'Asystent AI' : 'Watek rozmowy'
        }))
      })
    }

    if (chatResults.value.length) {
      items.unshift({
        id: 'chat-search',
        label: 'Czat - wyniki',
        ignoreFilter: true,
        items: chatResults.value.map(result => ({
          label: result.thread_title || (result.thread_type === 'ai' ? 'Czat AI' : `Watek ${result.thread_id}`),
          icon: 'i-lucide-message-square',
          to: `/dashboard/chat?thread=${result.thread_id}&message=${result.message_id}&message_at=${encodeURIComponent(result.created_at)}`,
          description: result.snippet
        }))
      })
    }

    return items
  })

  return {
    groups,
    searchTerm,
    chatLoading
  }
}
