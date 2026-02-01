<script lang="ts" setup>
import type { UserDTO } from '#shared/types/auth'
import type { AdminUsersMeta } from '~/composables/resources/useAdminResource'

const props = withDefaults(
  defineProps<{
    users?: UserDTO[]
    meta?: AdminUsersMeta | null
    loading?: boolean
    currentUserId?: number | null
  }>(),
  { users: () => [], meta: null, loading: false, currentUserId: null }
)

const emit = defineEmits<{
  'editRole': [UserDTO]
  'setStatus': [UserDTO, 'active' | 'blocked']
  'update:page': [number]
}>()

const canBlockSelf = computed(() => (user: UserDTO) => user.id !== props.currentUserId)

const openPopoverUserId = ref<number | null>(null)

function setPopoverOpen(userId: number, open: boolean) {
  openPopoverUserId.value = open ? userId : null
}

function closePopover() {
  openPopoverUserId.value = null
}

function onEditRoleClick(user: UserDTO) {
  emit('editRole', user)
  closePopover()
}

function onSetStatusClick(user: UserDTO) {
  if (!canBlockSelf.value(user)) return
  emit('setStatus', user, user.status === 'blocked' ? 'active' : 'blocked')
  closePopover()
}
</script>

<template>
  <UCard variant="soft">
    <div
      v-if="loading"
      class="space-y-2 p-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="h-10 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
      />
    </div>
    <template
      v-else-if="!users.length"
    >
      <div class="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        Brak użytkowników
      </div>
    </template>
    <div
      v-else
      class="overflow-x-auto"
    >
      <table class="w-full text-left text-sm">
        <thead>
          <tr class="border-b border-neutral-200 dark:border-neutral-700">
            <th class="p-3 font-medium">
              Email / Nazwa
            </th>
            <th class="p-3 font-medium">
              Rola
            </th>
            <th class="p-3 font-medium">
              Status
            </th>
            <th class="p-3 font-medium text-right">
              Akcje
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="user in users"
            :key="user.id"
            class="border-b border-neutral-100 dark:border-neutral-800"
          >
            <td class="p-3">
              {{ user.email ?? user.username ?? `#${user.id}` }}
            </td>
            <td class="p-3">
              {{ user.role }}
            </td>
            <td class="p-3">
              <UBadge
                :color="user.status === 'blocked' ? 'error' : 'success'"
                variant="soft"
                size="xs"
              >
                {{ user.status === 'blocked' ? 'Zablokowany' : 'Aktywny' }}
              </UBadge>
            </td>
            <td class="p-3 text-right">
              <UPopover
                :open="openPopoverUserId === user.id"
                :popper="{ placement: 'bottom-end', offset: 4 }"
                @update:open="(v) => setPopoverOpen(user.id, v)"
              >
                <UButton
                  variant="ghost"
                  color="neutral"
                  size="xs"
                  icon="i-lucide-more-vertical"
                  aria-haspopup="menu"
                  aria-expanded="openPopoverUserId === user.id"
                />
                <template #content>
                  <div class="min-w-40 rounded-md border border-default bg-default p-1 shadow-lg">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      class="w-full justify-start gap-2"
                      icon="i-lucide-user-cog"
                      @click="onEditRoleClick(user)"
                    >
                      Edytuj rolę
                    </UButton>
                    <UButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      class="w-full justify-start gap-2"
                      :icon="user.status === 'blocked' ? 'i-lucide-unlock' : 'i-lucide-lock'"
                      :disabled="!canBlockSelf(user)"
                      @click="onSetStatusClick(user)"
                    >
                      {{ user.status === 'blocked' ? 'Odblokuj' : 'Zablokuj' }}
                    </UButton>
                  </div>
                </template>
              </UPopover>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template
      v-if="meta && meta.total > meta.limit"
      #footer
    >
      <div class="flex items-center justify-between">
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ meta.total }} użytkowników
        </p>
        <div class="flex gap-2">
          <UButton
            variant="soft"
            size="xs"
            color="neutral"
            :disabled="meta.page <= 1"
            @click="$emit('update:page', meta.page - 1)"
          >
            Poprzednia
          </UButton>
          <span class="self-center text-sm">
            {{ meta.page }} / {{ Math.ceil(meta.total / meta.limit) }}
          </span>
          <UButton
            variant="soft"
            size="xs"
            color="neutral"
            :disabled="meta.page >= Math.ceil(meta.total / meta.limit)"
            @click="emit('update:page', meta.page + 1)"
          >
            Następna
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>
