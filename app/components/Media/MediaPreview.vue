<script setup lang="ts">
/** Element podglądu — zgodny z MediaAssetDTO (mapowany w MediaLibrary) */
export interface Media {
  id: string
  index?: number
  mimeType: string
  previewUrl: string
  name: string
  pathUrl?: string
  description?: string
  author?: { username: string }
  createdAtAgo?: string
}

const props = defineProps<{
  isShowPreviewImage: boolean
  photos: Media[]
  preview: Media | null
}>()

// Typowane emity
const emits = defineEmits<{
  (e: 'close', value: boolean): void
  (e: 'preview', item: Media): void
}>()

// Stany komponentu
const isShowDescription = ref<boolean>(true)
const isShowDescriptionAll = ref<boolean>(true)
const isFullScreen = ref<boolean>(false)
const isShowHeader = ref<boolean>(false)
const isShowThumbnails = ref<boolean>(true)
interface CarouselApi {
  emblaApi?: { scrollTo: (index: number) => void }
}
const carousel = useTemplateRef<CarouselApi>('carousel')
const thumbnailCarousel = useTemplateRef<CarouselApi>('thumbnailCarousel')

// Indeks aktywnego slajdu
const activeIndex = ref(0)

// Aktualizacja activeIndex gdy zmienia się podgląd
watch(() => props.preview, (newPreview) => {
  if (newPreview && props.photos?.length) {
    if (typeof newPreview.index === 'number') {
      activeIndex.value = newPreview.index
    } else if (newPreview.id) {
      const foundIndex = props.photos.findIndex(photo => photo.id === newPreview.id)

      if (foundIndex !== -1) {
        activeIndex.value = foundIndex
      }
    }
  }
}, { immediate: true })

// Obsługa zmiany slajdu
const onSelect = (index: number) => {
  activeIndex.value = index
  if (props.photos && props.photos[index]) {
    emits('preview', { ...props.photos[index], index } as Media)
  }
}

// Metody nawigacji
const onClickPrev = () => {
  if (!props.photos?.length) return
  activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : props.photos.length - 1
  syncThumbnails()
}

const onClickNext = () => {
  if (!props.photos?.length) return
  activeIndex.value = activeIndex.value < props.photos.length - 1 ? activeIndex.value + 1 : 0
  syncThumbnails()
}

const selectThumbnail = (index: number) => {
  activeIndex.value = index
  // Przesunięcie głównej karuzeli do wybranego indeksu
  if (carousel.value?.emblaApi) {
    carousel.value.emblaApi.scrollTo(index)
  }
  // Emitowanie zdarzenia podglądu
  if (props.photos && props.photos[index]) {
    emits('preview', { ...props.photos[index], index } as Media)
  }
}

// Synchronizacja miniatur z główną karuzelą
const syncThumbnails = () => {
  if (thumbnailCarousel.value?.emblaApi) {
    thumbnailCarousel.value.emblaApi.scrollTo(activeIndex.value)
  }
}

// Pokazanie lub ukrycie opisu
const toggleDescription = () => {
  isShowDescription.value = !isShowDescription.value
}

// Przełączenie wszystkich opisów
const toggleAllDescriptions = () => {
  isShowDescriptionAll.value = !isShowDescriptionAll.value
  isShowDescription.value = isShowDescriptionAll.value
}

// Zamknięcie podglądu
const close = () => {
  emits('close', false)
}

// Określenie czy jest wiele zdjęć do pokazania miniatur
const hasMultiplePhotos = computed(() => props.photos && props.photos.length > 1)

// Bezpieczny dostęp do bieżącego zdjęcia
const currentPhoto = computed(() => {
  if (props.photos && props.photos.length > activeIndex.value) {
    return props.photos[activeIndex.value]
  }
  return null
})

// Określenie wielu klas dla głównego obrazu
const mainImageClasses = computed(() => {
  return [
    'max-h-full',
    'max-w-full',
    'object-contain',
    isFullScreen.value ? 'h-screen w-auto' : 'h-full w-auto'
  ]
})
</script>

<template>
  <teleport to="body">
    <transition
      enter-active-class="transition ease-in duration-300"
      enter-from-class="transform scale-0"
      enter-to-class="transform scale-100"
      leave-active-class="transition ease-in duration-300"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-[100vw]"
    >
      <div
        v-if="isShowPreviewImage"
        class="fixed w-screen h-screen top-0 left-0 bg-black/90 backdrop-blur z-50 flex flex-col justify-start items-center"
      >
        <!-- Obszar wyzwalający nagłówek w trybie pełnoekranowym -->
        <div
          v-if="isFullScreen"
          class="absolute top-0 left-0 h-10 w-screen z-40"
          @mouseover="isShowHeader = true"
          @mouseleave="isShowHeader = false"
        />

        <!-- Nagłówek z kontrolkami -->
        <header
          class="h-20 w-screen px-8 box-border"
          :class="isFullScreen ? isShowHeader ? 'absolute top-0 left-0 z-50 bg-black/60' : 'hidden' : 'relative mb-6 bg-black'"
          @mouseover="isShowHeader = true"
          @mouseleave="isShowHeader = false"
        >
          <div class="w-full h-full flex justify-between items-center px-5 box-border">
            <!-- Wskaźnik bieżącego slajdu -->
            <h2
              v-if="hasMultiplePhotos"
              class="flex text-lg text-blue-300 space-x-4"
            >
              <span class="text-gray-600">[</span>
              <span class="text-gray-600">{{ activeIndex + 1 }}</span>
              <span class="text-gray-600"> / </span>
              <span class="text-gray-600">{{ photos?.length }}</span>
              <span class="text-gray-600">]</span>
            </h2>

            <!-- Przyciski kontrolne -->
            <div class="w-full flex justify-end space-x-3 px-1 md:px-3 lg:px-6">
              <!-- Przycisk przełączania opisu -->
              <UTooltip :text="isShowDescription ? 'Ukryj opis. Double-clik wyłacza opisy' : isShowDescriptionAll ? 'Pokaż opis. Double-clik wyłacza opisy' : 'Double-clik wyłącz opisy'">
                <UButton
                  :icon="isShowDescriptionAll ? 'material-symbols:content-paste' : 'material-symbols:content-paste-off-sharp'"
                  variant="ghost"
                  square
                  :color="isShowDescription ? 'primary' : 'secondary'"
                  @click="toggleDescription"
                  @dblclick="toggleAllDescriptions"
                />
              </UTooltip>

              <!-- Przycisk przełączania miniatur -->
              <UTooltip
                :text="isShowThumbnails ? 'Wyłącz pasek boczny' : 'Pasek boczny'"
                class="hidden lg:block"
              >
                <UButton
                  :icon="isShowThumbnails ? 'i-material-symbols-gallery-thumbnail-outline' : 'i-solar-gallery-bold'"
                  variant="ghost"
                  square
                  :color="isShowThumbnails ? 'primary' : 'secondary'"
                  @click="isShowThumbnails = !isShowThumbnails"
                />
              </UTooltip>

              <!-- Przycisk trybu pełnoekranowego -->
              <UTooltip
                :text="isFullScreen ? 'Wyłącz fullscreen' : 'Fullscreen'"
                class="hidden md:block"
              >
                <UButton
                  :icon="isFullScreen ? 'ic:outline-fullscreen-exit' : 'ic:baseline-fullscreen'"
                  variant="ghost"
                  square
                  :color="isFullScreen ? 'primary' : 'secondary'"
                  @click="isFullScreen = !isFullScreen"
                />
              </UTooltip>

              <!-- Przycisk zamykania -->
              <UTooltip text="Zamknij">
                <UButton
                  icon="i-heroicons-x-mark"
                  variant="ghost"
                  square
                  color="secondary"
                  @click="close"
                />
              </UTooltip>
            </div>
          </div>
        </header>

        <!-- Kontener głównej karuzeli -->
        <div
          class="flex justify-center items-center overflow-hidden md:px-6 box-border duration-300"
          :class="isFullScreen ? 'absolute top-0 left-0 h-screen w-screen' : 'relative md:container md:mx-auto md:max-w-full h-[calc(100vh-180px)]'"
        >
          <!-- Główna karuzela zawartości -->
          <UCarousel
            v-if="photos && photos.length"
            ref="carousel"
            v-slot="{ item: photo }"
            loop
            arrows
            :items="photos"
            :model-value="activeIndex"
            :wrap-around="true"
            class="w-full h-full"
            :ui="{
              root: 'p-6',
              container: 'h-full flex',
              viewport: 'h-full w-full overflow-hidden flex items-center justify-center',
              item: 'h-full w-full min-w-full flex items-center justify-center shrink-0'
            }"
            :prev="{ onClick: onClickPrev }"
            :next="{ onClick: onClickNext }"
            @select="onSelect"
          >
            <div class="h-full w-full flex justify-center items-center min-w-0">
              <!-- Zawartość obrazu -->
              <template v-if="photo.mimeType?.startsWith('image/')">
                <img
                  :src="photo.previewUrl"
                  :alt="photo.name"
                  :class="mainImageClasses"
                  loading="lazy"
                  class="mx-auto block"
                >
              </template>

              <!-- Zawartość wideo -->
              <template v-else-if="photo.mimeType === 'video/mp4'">
                <video
                  class="max-w-full max-h-full mx-auto block object-contain"
                  controls
                  preload="metadata"
                  style="height: 80%"
                >
                  <source
                    :src="photo.previewUrl"
                    :type="photo.mimeType"
                  >
                  Twoja przeglądarka nie obsługuje tagu wideo.
                </video>
              </template>

              <!-- Osadzenie YouTube -->
              <template v-else-if="photo.mimeType === 'video/youTube'">
                <iframe
                  :src="`https://www.youtube.com/embed/${photo.pathUrl}`"
                  class="w-full lg:w-3/4 aspect-video max-h-full mx-auto block"
                  frameborder="0"
                  allowfullscreen
                  loading="lazy"
                  title="Odtwarzacz YouTube"
                  style="height: 80%"
                />
              </template>

              <!-- Fallback dla nieobsługiwanych mediów -->
              <template v-else>
                <div class="w-full h-32 flex flex-col items-center justify-center bg-gray-800">
                  <UIcon
                    name="i-heroicons-document"
                    class="w-12 h-12 text-gray-400"
                  />
                  <p class="text-gray-300 text-sm mt-2">
                    Nieobsługiwany format
                  </p>
                </div>
              </template>
            </div>
          </UCarousel>
        </div>

        <!-- Nakładka opisu -->
        <transition
          enter-active-class="transition ease-in duration-300"
          enter-from-class="transform scale-0"
          enter-to-class="transform scale-100"
          leave-active-class="transition ease-in duration-300"
          leave-from-class="transform scale-100"
          leave-to-class="transform scale-0"
        >
          <div
            v-if="currentPhoto?.description && isShowDescription"
            class="fixed top-20 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-2xl backdrop-blur-md bg-black/70 rounded-xl overflow-hidden border border-gray-500/30 shadow-xl"
          >
            <div class="flex items-center justify-between p-3 bg-gray-900/50">
              <h3 class="text-white/90 font-medium px-2">
                {{ currentPhoto.name }}
              </h3>
              <UButton
                icon="i-heroicons-x-mark"
                variant="ghost"
                color="secondary"
                square
                @click="isShowDescription = false"
              />
            </div>

            <div class="p-4">
              <div class="prose prose-invert max-w-none">
                <p
                  class="text-gray-200 leading-relaxed"
                >
                  {{ currentPhoto.description }}
                </p>
              </div>
            </div>

            <!-- Informacje o autorze i dacie -->
            <div
              v-if="currentPhoto.author"
              class="px-4 py-2 bg-gray-900/50 text-sm text-gray-400 flex items-center justify-between"
            >
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-heroicons-user-circle"
                  class="w-4 h-4"
                />
                {{ currentPhoto.author.username }}
              </div>
              <div
                v-if="currentPhoto.createdAtAgo"
                class="flex items-center gap-2"
              >
                <UIcon
                  name="i-heroicons-clock"
                  class="w-4 h-4"
                />
                {{ currentPhoto.createdAtAgo }}
              </div>
            </div>
          </div>
        </transition>

        <!-- Karuzela miniatur -->
        <div
          v-if="isShowThumbnails && hasMultiplePhotos"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl mx-auto flex justify-center overflow-hidden backdrop-blur-sm bg-black/30 rounded-xl p-4"
        >
          <UCarousel
            v-if="photos && photos.length"
            ref="thumbnailCarousel"
            v-slot="{ item: photo, index }"
            :items="photos"
            arrows
            loop
            :model-value="activeIndex"
            class="w-full h-32"
            :ui="{
              viewport: 'overflow-hidden flex items-center px-6',
              item: 'p-2 basis-1/8 h-full flex-shrink-0 min-w-[8rem] w-32 flex items-center justify-center',
              arrows: 'absolute left-8 right-8 top-1/2 -translate-y-1/2 z-10',
              container: 'flex gap-2',
              prev: 'bg-black/20 hover:bg-black/40 rounded-l-lg',
              next: 'bg-black/20 hover:bg-black/40 rounded-r-lg'
            }"
          >
            <!-- Miniatura obrazu -->
            <div
              class="h-28 w-28 min-h-28 min-w-28 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 shrink-0"
              :class="{ 'ring-2 scale-105 ring-primary-400': activeIndex === index }"
              @click="selectThumbnail(index)"
            >
              <!-- Miniatura obrazu -->
              <template v-if="photo.mimeType?.startsWith('image/')">
                <NuxtImg
                  :src="photo.previewUrl"
                  :alt="photo.name"
                  class="w-full h-full object-cover transition-transform hover:scale-105"
                  loading="lazy"
                />
              </template>

              <!-- Miniatura YouTube -->
              <template v-else-if="photo.mimeType === 'video/youTube'">
                <div class="relative w-full h-full">
                  <NuxtImg
                    :src="`https://img.youtube.com/vi/${photo.pathUrl}/mqdefault.jpg`"
                    :alt="photo.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <UIcon
                      name="i-mdi-youtube"
                      class="w-8 h-8 text-red-500"
                    />
                  </div>
                </div>
              </template>

              <!-- Miniatura wideo -->
              <template v-else-if="photo.mimeType === 'video/mp4'">
                <div class="relative w-full h-full">
                  <NuxtImg
                    :src="photo.previewUrl"
                    :alt="photo.name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <UIcon
                      name="i-heroicons-play"
                      class="w-8 h-8 text-white"
                    />
                  </div>
                </div>
              </template>
            </div>
          </UCarousel>
        </div>
      </div>
    </transition>
  </teleport>
</template>
