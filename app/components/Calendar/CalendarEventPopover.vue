<script lang="ts" setup>
import type { CalendarEventListItemDTO } from '#shared/types/calendar'
import type { EventCategoryDTO } from '#shared/types/event-category'
import { hexToRgba } from '~/utils/color'

const props = defineProps<{
  event: CalendarEventListItemDTO
  open: boolean
  categories?: EventCategoryDTO[]
  teamMembers?: Array<{ id: number | string, name: string, role?: string, avatarUrl?: string }>
  teamName?: string
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'edit' | 'cancel' | 'duplicate' | 'copyLink' | 'openChat' | 'moveScope', id: number): void
}>()

const isConfirmOpen = ref(false)

const startTime = computed(() => new Date(props.event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const endTime = computed(() => new Date(props.event.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const startDate = computed(() => new Date(props.event.start_at))
const endDate = computed(() => new Date(props.event.end_at))
const dateLabel = computed(() => {
  const start = startDate.value
  const end = endDate.value
  const sameDay = start.toDateString() === end.toDateString()
  const format = (value: Date) => value.toLocaleDateString('pl-PL', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
  return sameDay ? format(start) : `${format(start)} - ${format(end)}`
})
const durationLabel = computed(() => {
  const minutes = Math.max(0, Math.round((endDate.value.getTime() - startDate.value.getTime()) / 60000))
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} min`
  if (rest === 0) return `${hours} h`
  return `${hours} h ${rest} min`
})
const statusLabel = computed(() => (props.event.status === 'cancelled' ? 'Anulowane' : 'Zaplanowane'))
const category = computed(() => props.categories?.find(cat => cat.id === props.event.category_id) ?? null)
const categoryLabel = computed(() => category.value?.label ?? 'Brak kategorii')
const categoryIcon = computed(() => category.value?.icon ?? 'i-lucide-tag')
const categoryColor = computed(() => category.value?.color ?? '#64748B')
const categoryTone = computed(() => hexToRgba(categoryColor.value, 0.12) ?? 'transparent')
const hasTeamMembers = computed(() => Boolean(props.event.team_id && (props.teamMembers?.length ?? 0) > 0))

function closePopover() {
  emit('update:open', false)
}

function openConfirm() {
  isConfirmOpen.value = true
}

function confirmCancel() {
  emit('cancel', props.event.id)
  isConfirmOpen.value = false
  closePopover()
}

function onEdit() {
  emit('edit', props.event.id)
  closePopover()
}
</script>

<template>
  <UPopover
    :open="open"
    :popper="{ placement: 'right-start', offset: 8, strategy: 'fixed' }"
    @update:open="emit('update:open', $event)"
  >
    <template #default>
      <slot />
    </template>

    <template #content>
      <div class="min-w-72 rounded-md border border-neutral-200/80 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-900/95">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {{ event.title }}
            </p>
            <div
              class="mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium"
              :style="{ borderColor: categoryColor, color: categoryColor, backgroundColor: categoryTone }"
            >
              <UIcon
                :name="categoryIcon"
                class="size-3.5"
              />
              <span class="truncate">{{ categoryLabel }}</span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-lucide-pencil"
              @click="onEdit"
            />
            <UButton
              size="xs"
              variant="ghost"
              color="error"
              icon="i-lucide-trash"
              @click="openConfirm"
            />
            <UDropdownMenu
              :items="[[
                { label: 'Duplikuj', icon: 'i-lucide-copy', onClick: () => emit('duplicate', event.id) },
                { label: 'Skopiuj link', icon: 'i-lucide-link', onClick: () => emit('copyLink', event.id) },
                { label: 'Przenies do zespolu', icon: 'i-lucide-users', onClick: () => emit('moveScope', event.id) },
                { label: 'Otworz czat', icon: 'i-lucide-message-circle', onClick: () => emit('openChat', event.id) }
              ]]
              "
              :popper="{ placement: 'bottom-end', offset: 6 }"
            >
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-more-horizontal"
                aria-haspopup="menu"
              />
            </UDropdownMenu>
          </div>
        </div>
        <p class="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          {{ startTime }} - {{ endTime }}
        </p>
        <div class="mt-2 space-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <p class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-calendar"
              class="size-3.5"
            />
            {{ dateLabel }}
          </p>
          <p class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-clock"
              class="size-3.5"
            />
            {{ durationLabel }}
          </p>
          <p class="flex items-center gap-1.5">
            <UIcon
              name="i-lucide-info"
              class="size-3.5"
            />
            {{ statusLabel }}
          </p>
        </div>

        <div
          v-if="event.description"
          class="mt-3 border-t border-neutral-200/70 pt-2 dark:border-neutral-800/70"
        >
          <p class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            <UIcon
              name="i-lucide-align-left"
              class="size-3.5"
            />
            Opis
          </p>
          <p class="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
            {{ event.description }}
          </p>
        </div>

        <div
          v-if="event.location"
          class="mt-3 border-t border-neutral-200/70 pt-2 dark:border-neutral-800/70"
        >
          <p class="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            <UIcon
              name="i-lucide-map-pin"
              class="size-3.5"
            />
            Lokalizacja
          </p>
          <a
            :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-300"
          >
            <span>{{ event.location }}</span>
            <UIcon
              name="i-lucide-external-link"
              class="size-3"
            />
          </a>
          <div class="mt-2 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
            <iframe
              :src="`https://www.google.com/maps?q=${encodeURIComponent(event.location)}&output=embed&z=15`"
              width="100%"
              height="150"
              style="border:0;"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              title="Mapa lokalizacji"
            />
          </div>
        </div>

        <div
          v-if="hasTeamMembers"
          class="mt-3 border-t border-neutral-200/70 pt-2 dark:border-neutral-800/70"
        >
          <p class="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
            Zespol: {{ teamName ?? 'Brak nazwy' }}
          </p>
          <div class="mt-2 space-y-2">
            <div
              v-for="member in teamMembers"
              :key="member.id"
              class="flex items-center gap-2"
            >
              <UAvatar
                :src="member.avatarUrl"
                :alt="member.name"
                size="xs"
              />
              <div class="min-w-0">
                <p class="truncate text-xs text-neutral-800 dark:text-neutral-100">
                  {{ member.name }}
                </p>
                <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                  {{ member.role ?? 'Czlonek' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UPopover>

  <UModal v-model:open="isConfirmOpen">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold">
          Anuluj wydarzenie
        </h3>
        <UButton
          icon="i-lucide-x"
          variant="ghost"
          color="neutral"
          @click="isConfirmOpen = false"
        />
      </div>
    </template>
    <template #body>
      <UCard>
        <p class="text-sm text-neutral-600 dark:text-neutral-400">
          Czy na pewno chcesz anulowac to wydarzenie? Uczestnicy zostana poinformowani.
        </p>
        <div class="mt-4 flex justify-end gap-2">
          <UButton
            variant="ghost"
            color="neutral"
            @click="isConfirmOpen = false"
          >
            Zamknij
          </UButton>
          <UButton
            color="error"
            @click="confirmCancel"
          >
            Anuluj wydarzenie
          </UButton>
        </div>
      </UCard>
    </template>
  </UModal>
</template>
