<script lang="ts" setup>
import type { ProfileDTO } from '#shared/types'

interface Props {
  profile: ProfileDTO | null
}

const props = defineProps<Props>()

const getInitials = (): string => {
  if (props.profile?.name) {
    const parts = props.profile.name.split(' ').filter(p => p.length > 0)
    if (parts.length >= 2) {
      const first = parts[0]?.[0]
      const last = parts[parts.length - 1]?.[0]
      if (first && last) return `${first}${last}`.toUpperCase()
    }
    if (props.profile.name.length >= 2) return props.profile.name.slice(0, 2).toUpperCase()
  }
  return 'U'
}

/** Pełny URL avatara (origin + ścieżka), żeby UAvatar poprawnie ładował /api/media/:id/serve */
const avatarSrc = useAvatarSrc(() => props.profile?.avatarUrl)

const getFullName = (): string => props.profile?.name || props.profile?.username || 'Użytkownik'
</script>

<template>
  <UButton
    variant="ghost"
    color="neutral"
    size="sm"
    class="flex items-center justify-between w-full gap-2 px-2"
  >
    <div class="flex items-center gap-2">
      <UAvatar
        :src="avatarSrc"
        :alt="getFullName()"
        :text="getInitials()"
        size="sm"
        class="ring-2 ring-basic-200 dark:ring-basic-700"
      />
      <div class="flex flex-col items-start">
        <span class="text-sm font-medium text-basic-900 dark:text-basic-100">
          {{ getFullName() }}
        </span>
        <span class="text-xs text-basic-500 dark:text-basic-400">
          {{ profile?.email }}
        </span>
      </div>
    </div>
    <UIcon
      name="i-heroicons-chevron-down"
      class="hidden sm:block h-4 w-4 text-basic-500 dark:text-basic-400"
    />
  </UButton>
</template>
