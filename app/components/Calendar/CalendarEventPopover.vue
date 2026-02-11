<script lang="ts" setup>
import type { CalendarEventListItemDTO } from '#shared/types/calendar'

const props = defineProps<{
  event: CalendarEventListItemDTO
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'edit' | 'cancel' | 'duplicate' | 'copyLink' | 'openChat' | 'moveScope', id: number): void
}>()

const isConfirmOpen = ref(false)

const startTime = computed(() => new Date(props.event.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
const endTime = computed(() => new Date(props.event.end_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

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
      <div class="min-w-56 rounded-md border border-default bg-default p-3 shadow-lg">
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold">
            {{ event.title }}
          </p>
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
        <p class="mt-2 text-xs text-neutral-500">
          {{ startTime }} - {{ endTime }}
        </p>
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
