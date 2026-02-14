<script lang="ts" setup>
import type { CalendarEventListItemDTO } from '#shared/types/calendar'
import type { EventCategoryDTO } from '#shared/types/event-category'

const props = defineProps<{
  event: CalendarEventListItemDTO
  categories: EventCategoryDTO[]
}>()

const emit = defineEmits<{
  (e: 'edit' | 'cancel' | 'requestCancel' | 'duplicate' | 'copyLink' | 'copyTitle' | 'copyDate' | 'copyId' | 'copyDescription' | 'openChat' | 'shareChatLink' | 'moveScope', id: number): void
  (e: 'changeCategoryFor', value: [number, number | null]): void
}>()

function handleCategoryChange(categoryId: number | null) {
  emit('changeCategoryFor', [props.event.id, categoryId])
}

const defaultCategory = computed(() => {
  switch (props.event.category_id) {
    case null:
      return null
    default:
      return props.categories.find(c => c.id === props.event.category_id) ?? null
  }
})

const contentTop = computed(() => {
  return props.categories.map(c => c.slug === defaultCategory.value?.slug
    ? null
    : {
        icon: c.icon ? c.icon : 'i-lucide-tag' as string,
        color: c.color as string,
        slug: c.slug,
        label: c.label,
        onClick: () => handleCategoryChange(c.id)
      }).filter((item): item is Exclude<typeof item, null> => !!item)
})

function getEventMenuItems() {
  return [
    [
      { label: 'Edytuj', icon: 'i-lucide-edit-2', color: 'primary', onClick: () => emit('edit', props.event.id) },
      { label: 'Usuń', icon: 'i-lucide-x', color: 'error', onSelect: () => emit('requestCancel', props.event.id) },
      { label: 'Duplikuj', icon: 'i-lucide-copy', color: 'secondary', onSelect: () => emit('duplicate', props.event.id) }
    ],
    [
      {
        label: 'Kopiuj',
        icon: 'i-lucide-copy',
        children: [
          { label: 'ID', icon: 'i-lucide-hash', onSelect: () => emit('copyId', props.event.id) },
          { label: 'Tytul', icon: 'i-lucide-type', onSelect: () => emit('copyTitle', props.event.id) },
          { label: 'Data i czas', icon: 'i-lucide-calendar-clock', onSelect: () => emit('copyDate', props.event.id) },
          { label: 'Opis', icon: 'i-lucide-file-text', onSelect: () => emit('copyDescription', props.event.id) },
          { label: 'Link', icon: 'i-lucide-link', onSelect: () => emit('copyLink', props.event.id) }
        ]
      }
    ],
    [
      {
        label: 'Udostepnij',
        icon: 'i-lucide-share-2',
        children: [
          { label: 'Skopiuj link', icon: 'i-lucide-link', onSelect: () => emit('copyLink', props.event.id) },
          { label: 'Wiadomosc w czacie z linkiem', icon: 'i-lucide-send', onSelect: () => emit('shareChatLink', props.event.id) },
          { label: 'Otworz czat', icon: 'i-lucide-message-circle', onSelect: () => emit('openChat', props.event.id) }
        ]
      }
    ],
    [
      { label: 'Otworz czat', icon: 'i-lucide-message-circle', onSelect: () => emit('openChat', props.event.id) },
      { label: 'Przenies do zespolu', icon: 'i-lucide-users', onSelect: () => emit('moveScope', props.event.id) }
    ],
    [
      {
        label: 'Zmien kategorie',
        icon: 'i-lucide-tag',
        children: [
          { label: 'Brak', icon: 'i-lucide-x', onSelect: () => handleCategoryChange(null) },
          ...props.categories.map(c => ({
            label: c.label,
            icon: c.icon ? c.icon : 'i-lucide-tag' as string,
            onSelect: () => handleCategoryChange(c.id)
          }))
        ]
      }
    ]
  ]
}
</script>

<template>
  <UContextMenu :items="getEventMenuItems()">
    <template #content-top="{ sub }">
      <div v-if="!sub && contentTop.length > 0">
        <UTooltip
          v-for="item in contentTop"
          :key="item?.icon"
          :text="`Zmien kategorie na ${item?.label}`"
          placement="bottom"
        >
          <UButton
            variant="ghost"
            size="xl"
            class="px-1"
            :style="{ color: item?.color }"
            :icon="item?.icon"
            @click="item?.onClick && item.onClick()"
          />
        </UTooltip>

        <USeparator class="mb-2" />
      </div>
    </template>

    <slot />
  </UContextMenu>
</template>
