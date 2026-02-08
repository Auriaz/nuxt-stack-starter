<script setup lang="ts">
import { useDebounce } from '@vueuse/core'
import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { NotificationSchema } from '#shared/schemas/notification'
import type { TeamDTO, TeamMemberDTO, TeamInviteDTO, TeamRole } from '#shared/types/teams'
import type { FriendUserSummaryDTO } from '#shared/types/friends'
import ModalConfirmation from '~/components/Modal/Confirmation/ModalConfirmation.vue'
import { useTeamsResource } from '~/composables/resources/useTeamsResource'
import { useNotificationsSocket } from '~/composables/useNotificationsSocket'
import { useUsersResource } from '~/composables/resources/useUsersResource'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.TEAMS_READ
})

const route = useRoute()
const teamsResource = useTeamsResource()
const notificationsSocket = useNotificationsSocket()
const usersResource = useUsersResource()
const { user } = useAuth()

const teamId = computed(() => Number(route.params.id))
const team = ref<TeamDTO | null>(null)
const members = ref<TeamMemberDTO[]>([])
const invites = ref<TeamInviteDTO[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const searchTerm = ref('')
const debouncedTerm = useDebounce(searchTerm, 250)
const searchResults = ref<FriendUserSummaryDTO[]>([])
const searching = ref(false)
const pendingRefresh = ref(false)
let stopSocket: (() => void) | null = null
const deleteTeamModalRef = ref<InstanceType<typeof ModalConfirmation> | null>(null)

const roleOptions = [
  { label: 'Owner', value: 'owner' },
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' }
]

const canManage = computed(() => {
  const current = members.value.find(item => item.user_id === user.value?.id)
  return current?.role === 'owner' || current?.role === 'admin'
})

const isOwner = computed(() => {
  const current = members.value.find(item => item.user_id === user.value?.id)
  return current?.role === 'owner'
})

const isCurrentMember = computed(() => members.value.some(item => item.user_id === user.value?.id))

async function loadTeam() {
  isLoading.value = true
  error.value = null
  try {
    const [teamData, membersData] = await Promise.all([
      teamsResource.getTeam(teamId.value),
      teamsResource.listMembers(teamId.value)
    ])
    team.value = teamData
    members.value = membersData.members
    if (!isCurrentMember.value) {
      await navigateTo('/dashboard/teams')
      return
    }
    if (canManage.value) {
      const invitesData = await teamsResource.listInvites(teamId.value)
      invites.value = invitesData.invites
    } else {
      invites.value = []
    }
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac zespolu'
  } finally {
    isLoading.value = false
    if (pendingRefresh.value) {
      pendingRefresh.value = false
      void loadTeam()
    }
  }
}

function requestRefresh() {
  if (isLoading.value) {
    pendingRefresh.value = true
    return
  }
  void loadTeam()
}

async function handleRemovalNotification(title: string, actionUrl?: string) {
  if (actionUrl !== '/dashboard/teams') return
  const lowered = title.toLowerCase()
  if (lowered.includes('usunieto z zespolu') || lowered.includes('zespol usuniety')) {
    await navigateTo('/dashboard/teams')
  }
}

async function inviteUser(userId: number) {
  await teamsResource.inviteUser(teamId.value, { invitee_id: userId })
  await loadTeam()
}

async function changeRole(userId: number, role: TeamRole) {
  await teamsResource.changeMemberRole(teamId.value, userId, { role })
  await loadTeam()
}

async function removeMember(userId: number) {
  await teamsResource.removeMember(teamId.value, userId)
  await loadTeam()
}

async function cancelInvite(inviteId: number) {
  await teamsResource.cancelInvite(teamId.value, inviteId)
  await loadTeam()
}

async function deleteInvite(inviteId: number) {
  await teamsResource.deleteInvite(teamId.value, inviteId)
  await loadTeam()
}

async function confirmDeleteTeam() {
  if (!isOwner.value) return
  await teamsResource.deleteTeam(teamId.value)
  await navigateTo('/dashboard/teams')
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
  loadTeam()
  notificationsSocket.connect()
  stopSocket = notificationsSocket.onEvent((event) => {
    if (event.type !== 'notification.new') return
    const parsed = safeParse(NotificationSchema, event.payload)
    if (!parsed.success) return
    const actionUrl = parsed.output.action_url
    void handleRemovalNotification(parsed.output.title, actionUrl)
    if (!actionUrl) return
    const teamPath = `/dashboard/teams/${teamId.value}`
    if (actionUrl === teamPath || actionUrl.startsWith(`${teamPath}?`)) {
      requestRefresh()
    }
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
      :title="team?.name || 'Zespol'"
      icon="i-lucide-users-2"
    >
      <template #body>
        <div class="space-y-6">
          <UCard>
            <template #header>
              <p class="font-semibold">
                Zapros do zespolu
              </p>
            </template>
            <div class="space-y-3">
              <UInput
                v-model="searchTerm"
                placeholder="Szukaj uzytkownika"
                :disabled="!canManage"
              />
              <div
                v-if="!canManage"
                class="text-xs text-muted"
              >
                Brak uprawnien do zapraszania
              </div>
              <div
                v-else-if="searching"
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
                    :disabled="!canManage"
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
                  Czlonkowie
                </p>
                <span class="text-xs text-muted">{{ members.length }}</span>
              </div>
            </template>
            <div
              v-if="isLoading"
              class="text-sm text-muted"
            >
              Ladowanie...
            </div>
            <div
              v-else-if="members.length === 0"
              class="text-sm text-muted"
            >
              Brak czlonkow
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="member in members"
                :key="member.id"
                class="flex flex-wrap items-center justify-between gap-3 rounded border border-default px-3 py-2"
              >
                <div>
                  <div class="font-medium">
                    {{ member.user?.name || member.user?.username }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ member.user?.email }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <USelect
                    :model-value="member.role"
                    :items="roleOptions"
                    :disabled="!canManage || member.role === 'owner'"
                    @update:model-value="(value) => changeRole(member.user_id, value as TeamRole)"
                  />
                  <UButton
                    size="sm"
                    variant="outline"
                    :disabled="!canManage || member.role === 'owner'"
                    @click="removeMember(member.user_id)"
                  >
                    Usun
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-semibold">
                  Zaproszenia
                </p>
                <span class="text-xs text-muted">{{ invites.length }}</span>
              </div>
            </template>
            <div
              v-if="invites.length === 0"
              class="text-sm text-muted"
            >
              Brak zaproszen
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="invite in invites"
                :key="invite.id"
                class="flex flex-wrap items-center justify-between gap-3 rounded border border-default px-3 py-2"
              >
                <div>
                  <div class="font-medium">
                    {{ invite.invitee?.name || invite.invitee?.username }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ invite.invitee?.email }}
                  </div>
                </div>
                <div class="flex items-center gap-2 text-xs text-muted">
                  <span class="rounded bg-muted px-2 py-1">{{ invite.status }}</span>
                  <UButton
                    size="sm"
                    variant="outline"
                    :disabled="!canManage || invite.status !== 'pending'"
                    @click="cancelInvite(invite.id)"
                  >
                    Anuluj
                  </UButton>
                  <UButton
                    size="sm"
                    variant="outline"
                    :disabled="!canManage || invite.status === 'pending'"
                    @click="deleteInvite(invite.id)"
                  >
                    Usun
                  </UButton>
                </div>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <p class="font-semibold text-error">
                Strefa niebezpieczna
              </p>
            </template>
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="font-medium">
                  Usun zespol
                </div>
                <div class="text-xs text-muted">
                  Ta akcja usunie zespol i wszystkich czlonkow.
                </div>
              </div>
              <UButton
                size="sm"
                color="error"
                variant="soft"
                :disabled="!isOwner"
                @click="deleteTeamModalRef?.open()"
              >
                Usun zespol
              </UButton>
            </div>
          </UCard>

          <ModalConfirmation
            ref="deleteTeamModalRef"
            title="Usun zespol"
            description="Ta akcja usunie zespol i wszystkich czlonkow. Tej akcji nie da sie cofnac."
            confirm-label="Usun"
            cancel-label="Anuluj"
            variant="danger"
            @confirm="confirmDeleteTeam"
          />

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
