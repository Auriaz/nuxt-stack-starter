<script setup lang="ts">
import { useDebounce } from '@vueuse/core'
import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { NotificationSchema } from '#shared/schemas/notification'
import type { FriendRequestDTO, FriendUserSummaryDTO } from '#shared/types/friends'
import { useFriendsResource } from '~/composables/resources/useFriendsResource'
import { useNotificationsSocket } from '~/composables/useNotificationsSocket'
import { useUsersResource } from '~/composables/resources/useUsersResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.FRIENDS_READ
})

useSeoMeta({
  title: 'Znajomi - Dashboard',
  description: 'Zarzadzanie znajomymi'
})

const friendsResource = useFriendsResource()
const notificationsSocket = useNotificationsSocket()
const usersResource = useUsersResource()

const isLoading = ref(false)
const error = ref<string | null>(null)
const friends = ref<FriendUserSummaryDTO[]>([])
const incoming = ref<FriendRequestDTO[]>([])
const outgoing = ref<FriendRequestDTO[]>([])
const blocked = ref<FriendRequestDTO[]>([])

const searchTerm = ref('')
const debouncedTerm = useDebounce(searchTerm, 250)
const searchResults = ref<FriendUserSummaryDTO[]>([])
const searching = ref(false)
const pendingRefresh = ref(false)
let stopSocket: (() => void) | null = null

async function loadFriends() {
  isLoading.value = true
  error.value = null
  try {
    const data = await friendsResource.listFriends()
    friends.value = data.friends
    incoming.value = data.incoming
    outgoing.value = data.outgoing
    blocked.value = data.blocked
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac listy znajomych'
  } finally {
    isLoading.value = false
    if (pendingRefresh.value) {
      pendingRefresh.value = false
      void loadFriends()
    }
  }
}

function requestRefresh() {
  if (isLoading.value) {
    pendingRefresh.value = true
    return
  }
  void loadFriends()
}

async function inviteUser(userId: number) {
  await friendsResource.sendRequest({ receiver_id: userId })
  await loadFriends()
}

async function acceptRequest(id: number) {
  await friendsResource.acceptRequest(id)
  await loadFriends()
}

async function declineRequest(id: number) {
  await friendsResource.declineRequest(id)
  await loadFriends()
}

async function cancelRequest(id: number) {
  await friendsResource.cancelRequest(id)
  await loadFriends()
}

async function blockUser(userId: number) {
  await friendsResource.blockUser(userId)
  await loadFriends()
}

async function unblockUser(userId: number) {
  await friendsResource.unblockUser(userId)
  await loadFriends()
}

async function removeFriend(userId: number) {
  await friendsResource.removeFriend(userId)
  await loadFriends()
}

watch(debouncedTerm, async (term) => {
  const q = term.trim()
  if (q.length < 2) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const results = await usersResource.searchUsers(q)
    searchResults.value = results
  } finally {
    searching.value = false
  }
})

onMounted(() => {
  loadFriends()
  notificationsSocket.connect()
  stopSocket = notificationsSocket.onEvent((event) => {
    if (event.type !== 'notification.new') return
    const parsed = safeParse(NotificationSchema, event.payload)
    if (!parsed.success) return
    if (parsed.output.action_url !== '/dashboard/friends') return
    requestRefresh()
  })
})

onBeforeUnmount(() => {
  stopSocket?.()
  stopSocket = null
})
</script>

<template>
  <NuxtLayout name="dashboard">
    <DashboardPanel
      title="Znajomi"
      icon="i-lucide-users"
    >
      <template #body>
        <div class="space-y-6">
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div>
                  <p class="font-semibold">
                    Zaproś znajomego
                  </p>
                  <p class="text-sm text-muted">
                    Szukaj po emailu lub nazwie
                  </p>
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <UInput
                v-model="searchTerm"
                placeholder="Szukaj uzytkownika"
              />
              <div
                v-if="searching"
                class="text-sm text-muted"
              >
                Szukam...
              </div>
              <div
                v-else-if="searchResults.length === 0"
                class="text-sm text-muted"
              >
                Wpisz co najmniej 2 znaki
              </div>
              <div
                v-else
                class="space-y-2"
              >
                <div
                  v-for="result in searchResults"
                  :key="result.id"
                  class="flex items-center justify-between rounded border border-default px-3 py-2"
                >
                  <div class="min-w-0">
                    <div class="font-medium truncate">
                      {{ result.name || result.username }}
                    </div>
                    <div class="text-xs text-muted truncate">
                      {{ result.email }}
                    </div>
                  </div>
                  <UButton
                    size="sm"
                    @click="inviteUser(result.id)"
                  >
                    Zaproś
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-semibold">
                  Znajomi
                </p>
                <span class="text-xs text-muted">{{ friends.length }}</span>
              </div>
            </template>

            <div
              v-if="isLoading"
              class="text-sm text-muted"
            >
              Ladowanie...
            </div>
            <div
              v-else-if="friends.length === 0"
              class="text-sm text-muted"
            >
              Brak znajomych
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="friend in friends"
                :key="friend.id"
                class="flex items-center justify-between rounded border border-default px-3 py-2"
              >
                <div>
                  <div class="font-medium">
                    {{ friend.name || friend.username }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ friend.email }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <UButton
                    size="sm"
                    variant="outline"
                    @click="removeFriend(friend.id)"
                  >
                    Usun
                  </UButton>
                  <UButton
                    size="sm"
                    color="error"
                    variant="soft"
                    @click="blockUser(friend.id)"
                  >
                    Zablokuj
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <UCard>
              <template #header>
                <p class="font-semibold">
                  Zaproszenia przychodzace
                </p>
              </template>
              <div
                v-if="incoming.length === 0"
                class="text-sm text-muted"
              >
                Brak zaproszen
              </div>
              <div
                v-else
                class="space-y-2"
              >
                <div
                  v-for="req in incoming"
                  :key="req.id"
                  class="flex items-center justify-between rounded border border-default px-3 py-2"
                >
                  <div>
                    <div class="font-medium">
                      {{ req.sender?.name || req.sender?.username }}
                    </div>
                    <div class="text-xs text-muted">
                      {{ req.sender?.email }}
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <UButton
                      size="sm"
                      @click="acceptRequest(req.id)"
                    >
                      Akceptuj
                    </UButton>
                    <UButton
                      size="sm"
                      variant="outline"
                      @click="declineRequest(req.id)"
                    >
                      Odrzuc
                    </UButton>
                  </div>
                </div>
              </div>
            </UCard>

            <UCard>
              <template #header>
                <p class="font-semibold">
                  Zaproszenia wyslane
                </p>
              </template>
              <div
                v-if="outgoing.length === 0"
                class="text-sm text-muted"
              >
                Brak zaproszen
              </div>
              <div
                v-else
                class="space-y-2"
              >
                <div
                  v-for="req in outgoing"
                  :key="req.id"
                  class="flex items-center justify-between rounded border border-default px-3 py-2"
                >
                  <div>
                    <div class="font-medium">
                      {{ req.receiver?.name || req.receiver?.username }}
                    </div>
                    <div class="text-xs text-muted">
                      {{ req.receiver?.email }}
                    </div>
                  </div>
                  <UButton
                    size="sm"
                    variant="outline"
                    @click="cancelRequest(req.id)"
                  >
                    Anuluj
                  </UButton>
                </div>
              </div>
            </UCard>
          </div>

          <UCard>
            <template #header>
              <p class="font-semibold">
                Zablokowani
              </p>
            </template>
            <div
              v-if="blocked.length === 0"
              class="text-sm text-muted"
            >
              Brak zablokowanych
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="req in blocked"
                :key="req.id"
                class="flex items-center justify-between rounded border border-default px-3 py-2"
              >
                <div>
                  <div class="font-medium">
                    {{ req.receiver?.name || req.receiver?.username }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ req.receiver?.email }}
                  </div>
                </div>
                <UButton
                  size="sm"
                  variant="outline"
                  @click="unblockUser(req.receiver_id)"
                >
                  Odblokuj
                </UButton>
              </div>
            </div>
          </UCard>

          <UAlert
            v-if="error"
            color="error"
            variant="soft"
            :title="error"
          />
        </div>
      </template>
    </DashboardPanel>
  </NuxtLayout>
</template>
