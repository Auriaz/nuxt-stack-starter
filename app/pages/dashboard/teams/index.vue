<script setup lang="ts">
import { safeParse } from 'valibot'
import { PERMISSIONS } from '#shared/permissions'
import { NotificationSchema } from '#shared/schemas/notification'
import type { TeamDTO, TeamInviteDTO } from '#shared/types/teams'
import { useTeamsResource } from '~/composables/resources/useTeamsResource'
import { useNotificationsSocket } from '~/composables/useNotificationsSocket'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
  permission: PERMISSIONS.TEAMS_READ
})

useSeoMeta({
  title: 'Zespoly - Dashboard',
  description: 'Zarzadzanie zespolami'
})

const teamsResource = useTeamsResource()
const notificationsSocket = useNotificationsSocket()

const teams = ref<TeamDTO[]>([])
const invites = ref<TeamInviteDTO[]>([])
const isLoading = ref(false)
const isLoadingInvites = ref(false)
const error = ref<string | null>(null)
const pendingRefresh = ref(false)
let stopSocket: (() => void) | null = null

const createName = ref('')
const creating = ref(false)

async function loadTeams() {
  isLoading.value = true
  error.value = null
  try {
    const data = await teamsResource.listTeams()
    teams.value = data.teams
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac zespolow'
  } finally {
    isLoading.value = false
    if (pendingRefresh.value) {
      pendingRefresh.value = false
      void loadTeams()
      void loadInvites()
    }
  }
}

async function loadInvites() {
  isLoadingInvites.value = true
  try {
    const data = await teamsResource.listMyInvites()
    invites.value = data.invites
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Nie udalo sie pobrac zaproszen'
  } finally {
    isLoadingInvites.value = false
  }
}

async function acceptInvite(invite: TeamInviteDTO) {
  await teamsResource.acceptInvite(invite.team_id, invite.id)
  await Promise.all([loadTeams(), loadInvites()])
}

async function declineInvite(invite: TeamInviteDTO) {
  await teamsResource.declineInvite(invite.team_id, invite.id)
  await loadInvites()
}

async function removeInvite(invite: TeamInviteDTO) {
  await teamsResource.deleteMyInvite(invite.id)
  await loadInvites()
}

function requestRefresh() {
  if (isLoading.value) {
    pendingRefresh.value = true
    return
  }
  void loadTeams()
  void loadInvites()
}

async function createTeam() {
  if (!createName.value.trim()) {
    return
  }
  creating.value = true
  try {
    await teamsResource.createTeam({
      name: createName.value.trim()
    })
    createName.value = ''
    await loadTeams()
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  loadTeams()
  loadInvites()
  notificationsSocket.connect()
  stopSocket = notificationsSocket.onEvent((event) => {
    if (event.type !== 'notification.new') return
    const parsed = safeParse(NotificationSchema, event.payload)
    if (!parsed.success) return
    const actionUrl = parsed.output.action_url
    if (!actionUrl) return
    if (actionUrl === '/dashboard/teams' || actionUrl.startsWith('/dashboard/teams/')) {
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
      title="Zespoly"
      icon="i-lucide-users-2"
    >
      <template #body>
        <div class="space-y-6">
          <UCard>
            <template #header>
              <p class="font-semibold">
                Nowy zespol
              </p>
            </template>
            <div class="grid gap-3 md:grid-cols-2">
              <UInput
                v-model="createName"
                placeholder="Nazwa zespolu"
              />
            </div>
            <div class="mt-3">
              <UButton
                :loading="creating"
                @click="createTeam"
              >
                Utworz zespol
              </UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-semibold">
                  Twoje zespoly
                </p>
                <span class="text-xs text-muted">{{ teams.length }}</span>
              </div>
            </template>
            <div
              v-if="isLoading"
              class="text-sm text-muted"
            >
              Ladowanie...
            </div>
            <div
              v-else-if="teams.length === 0"
              class="text-sm text-muted"
            >
              Brak zespolow
            </div>
            <div
              v-else
              class="grid gap-3 md:grid-cols-2"
            >
              <NuxtLink
                v-for="team in teams"
                :key="team.id"
                :to="`/dashboard/teams/${team.id}`"
                class="rounded border border-default p-4 hover:bg-muted"
              >
                <div class="font-semibold">{{ team.name }}</div>
                <div class="text-sm text-muted">Slug: {{ team.slug || 'brak' }}</div>
              </NuxtLink>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <p class="font-semibold">
                  Zaproszenia do zespolow
                </p>
                <span class="text-xs text-muted">{{ invites.length }}</span>
              </div>
            </template>
            <div
              v-if="isLoadingInvites"
              class="text-sm text-muted"
            >
              Ladowanie...
            </div>
            <div
              v-else-if="invites.length === 0"
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
                    {{ invite.team?.name || `Zespol #${invite.team_id}` }}
                  </div>
                  <div class="text-xs text-muted">
                    Zaprosil: {{ invite.inviter?.name || invite.inviter?.username }}
                  </div>
                  <div class="text-xs text-muted">
                    Status: {{ invite.status }}
                  </div>
                </div>
                <div class="flex gap-2">
                  <UButton
                    v-if="invite.status === 'pending'"
                    size="sm"
                    @click="acceptInvite(invite)"
                  >
                    Akceptuj
                  </UButton>
                  <UButton
                    v-if="invite.status === 'pending'"
                    size="sm"
                    variant="outline"
                    @click="declineInvite(invite)"
                  >
                    Odrzuc
                  </UButton>
                  <UButton
                    v-if="invite.status === 'declined'"
                    size="sm"
                    variant="outline"
                    @click="removeInvite(invite)"
                  >
                    Usun
                  </UButton>
                </div>
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
