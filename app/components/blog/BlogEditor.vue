<script setup lang="ts">
import type { MediaAssetDTO } from '#shared/types'
import type { ArrayOrNested, EditorCustomHandlers, EditorToolbarItem } from '#ui/types'
import { useMediaResource } from '~/composables/resources/useMediaResource'
import { useRequestURL } from '#imports'
import { useEditorCompletion } from '~/composables/useEditorCompletion'

interface Props {
  modelValue: string
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Treść posta (Markdown). Użyj / dla poleceń.'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const mediaResource = useMediaResource()
const requestURL = useRequestURL()
const toast = useToast()
const showMediaModal = ref(false)
const imageItems = ref<MediaAssetDTO[]>([])
const loadingImages = ref(false)

/** Ref do UEditor — slot przekazuje editor (TipTap Editor). */
const editorRef = ref<{ editor?: unknown } | null>(null)

const {
  extension: completionExtension,
  handlers: aiHandlers,
  isLoading: aiLoading
} = useEditorCompletion(editorRef, {
  onError: (err) => {
    let code: string | undefined
    let msg: string
    const rawMessage = err instanceof Error ? err.message : 'Błąd asystenta AI'
    try {
      const parsed = typeof rawMessage === 'string' && rawMessage.startsWith('{') ? JSON.parse(rawMessage) : null
      code = parsed?.error?.code
      msg = parsed?.error?.message ?? rawMessage
    } catch {
      code = (err as { data?: { error?: { code?: string } } })?.data?.error?.code
      msg = (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? rawMessage
    }
    const isMissingKey = code === 'MISSING_API_KEY' || (typeof msg === 'string' && msg.includes('Skonfiguruj klucz'))
    const isQuota = code === 'QUOTA_EXCEEDED' || /quota|billing|exceeded|rate limit|check your plan/i.test(String(msg))
    const title = isMissingKey ? 'Brak klucza API' : isQuota ? 'Limit konta OpenAI' : 'Błąd asystenta AI'
    const description = isMissingKey
      ? 'Dodaj klucz API w Ustawieniach → Integracje, aby używać asystenta w edytorze.'
      : isQuota
        ? 'Przekroczono limit lub brak środków na koncie OpenAI. Sprawdź plan i rozliczenia w panelu OpenAI.'
        : msg
    toast.add({
      title,
      description,
      color: 'warning',
      actions:
        isMissingKey
          ? [{ label: 'Ustawienia', onClick: (_event: MouseEvent) => { void navigateTo('/dashboard/settings?tab=integrations') } }]
          : isQuota
            ? [{ label: 'OpenAI Billing', onClick: (_event: MouseEvent) => { window.open('https://platform.openai.com/account/billing', '_blank') } }]
            : undefined
    })
  }
})

const customHandlers = { ...aiHandlers }

/** Lepsze wklejanie: zawsze używamy text/plain i wstawiamy jako markdown (bez śmieciowego HTML z Worda/Docs). */
function handlePaste(_view: unknown, event: ClipboardEvent, _slice: unknown): boolean {
  const plain = event.clipboardData?.getData('text/plain')?.trim()
  if (!plain) return false
  const editor = editorRef.value?.editor as { chain: () => { focus: () => { insertContent: (c: string, o?: { contentType?: string }) => { run: () => void } } } } | undefined
  if (!editor) return false
  event.preventDefault()
  editor.chain().focus().insertContent(plain, { contentType: 'markdown' }).run()
  return true
}

const editorProps = { handlePaste }

function imageUrl(asset: MediaAssetDTO): string {
  const path = mediaResource.serveUrl(asset.id)
  if (path.startsWith('http')) return path
  const base = requestURL?.origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return base + path
}

async function loadImages() {
  loadingImages.value = true
  try {
    const result = await mediaResource.list({ type: 'image', perPage: 48 })
    if (result) imageItems.value = result.items
  } finally {
    loadingImages.value = false
  }
}

function handleMediaSelect(asset: MediaAssetDTO) {
  if (asset.type !== 'image') return
  const url = imageUrl(asset)
  const editor = editorRef.value?.editor as { chain: () => { focus: () => { setImage: (a: { src: string }) => { run: () => void } } }, getHTML: () => string } | undefined
  if (editor) {
    editor.chain().focus().setImage({ src: url }).run()
    emit('update:modelValue', editor.getHTML())
  }
  showMediaModal.value = false
}

watch(showMediaModal, (open) => {
  if (open) loadImages()
})

const suggestionItems = [
  [
    { type: 'label', label: 'Tekst' },
    { kind: 'paragraph', label: 'Paragraf', icon: 'i-lucide-type' },
    { kind: 'heading', level: 1, label: 'Nagłówek 1', icon: 'i-lucide-heading-1' },
    { kind: 'heading', level: 2, label: 'Nagłówek 2', icon: 'i-lucide-heading-2' },
    { kind: 'heading', level: 3, label: 'Nagłówek 3', icon: 'i-lucide-heading-3' }
  ],
  [
    { type: 'label', label: 'Listy' },
    { kind: 'bulletList', label: 'Lista punktowana', icon: 'i-lucide-list' },
    { kind: 'orderedList', label: 'Lista numerowana', icon: 'i-lucide-list-ordered' }
  ],
  [
    { type: 'label', label: 'Wstaw' },
    { kind: 'blockquote', label: 'Cytat', icon: 'i-lucide-text-quote' },
    { kind: 'codeBlock', label: 'Blok kodu', icon: 'i-lucide-square-code' },
    { kind: 'horizontalRule', label: 'Separator', icon: 'i-lucide-separator-horizontal' },
    { kind: 'image', label: 'Obraz', icon: 'i-lucide-image' }
  ],
  [
    { type: 'label', label: 'AI' },
    { kind: 'aiContinue', label: 'Kontynuuj z AI', icon: 'i-lucide-sparkles' },
    { kind: 'aiFix', label: 'Popraw gramatykę', icon: 'i-lucide-spell-check' },
    { kind: 'aiExtend', label: 'Rozwiń fragment', icon: 'i-lucide-unfold-vertical' },
    { kind: 'aiReduce', label: 'Skróć fragment', icon: 'i-lucide-fold-vertical' },
    { kind: 'aiSimplify', label: 'Uprość tekst', icon: 'i-lucide-lightbulb' },
    { kind: 'aiSummarize', label: 'Podsumuj', icon: 'i-lucide-list' },
    { kind: 'aiTranslate', label: 'Tłumacz', icon: 'i-lucide-languages', language: 'angielski' }
  ]
]

const fixedToolbarItems = computed<ArrayOrNested<EditorToolbarItem<EditorCustomHandlers>>>(() => [
  [
    {
      icon: 'i-lucide-sparkles',
      label: 'AI',
      variant: 'soft',
      loading: aiLoading.value,
      tooltip: { text: 'Asystent AI' },
      content: { align: 'start' },
      items: [
        { kind: 'aiFix', icon: 'i-lucide-spell-check', label: 'Popraw gramatykę' },
        { kind: 'aiExtend', icon: 'i-lucide-unfold-vertical', label: 'Rozwiń tekst' },
        { kind: 'aiReduce', icon: 'i-lucide-fold-vertical', label: 'Skróć tekst' },
        { kind: 'aiSimplify', icon: 'i-lucide-lightbulb', label: 'Uprość tekst' },
        { kind: 'aiContinue', icon: 'i-lucide-text', label: 'Kontynuuj zdanie' },
        { kind: 'aiSummarize', icon: 'i-lucide-list', label: 'Podsumuj' },
        {
          icon: 'i-lucide-languages',
          label: 'Tłumacz',
          children: [
            { kind: 'aiTranslate', language: 'angielski', label: 'Angielski' },
            { kind: 'aiTranslate', language: 'niemiecki', label: 'Niemiecki' },
            { kind: 'aiTranslate', language: 'francuski', label: 'Francuski' }
          ]
        }
      ]
    }
  ],
  [
    { kind: 'undo', icon: 'i-lucide-undo', tooltip: { text: 'Cofnij' } },
    { kind: 'redo', icon: 'i-lucide-redo', tooltip: { text: 'Przywróć' } }
  ],
  [
    {
      icon: 'i-lucide-heading',
      tooltip: { text: 'Nagłówki' },
      content: { align: 'start' },
      items: [
        { kind: 'heading', level: 1, icon: 'i-lucide-heading-1', label: 'H1' },
        { kind: 'heading', level: 2, icon: 'i-lucide-heading-2', label: 'H2' },
        { kind: 'heading', level: 3, icon: 'i-lucide-heading-3', label: 'H3' },
        { kind: 'heading', level: 4, icon: 'i-lucide-heading-4', label: 'H4' }
      ]
    },
    {
      icon: 'i-lucide-list',
      tooltip: { text: 'Listy' },
      content: { align: 'start' },
      items: [
        { kind: 'bulletList', icon: 'i-lucide-list', label: 'Lista punktowana' },
        { kind: 'orderedList', icon: 'i-lucide-list-ordered', label: 'Lista numerowana' }
      ]
    },
    { kind: 'blockquote', icon: 'i-lucide-text-quote', tooltip: { text: 'Cytat' } },
    { kind: 'codeBlock', icon: 'i-lucide-square-code', tooltip: { text: 'Blok kodu' } },
    { kind: 'horizontalRule', icon: 'i-lucide-separator-horizontal', tooltip: { text: 'Separator' } }
  ],
  [
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } },
    {
      icon: 'i-lucide-image',
      tooltip: { text: 'Wstaw obraz' },
      onClick: () => { showMediaModal.value = true }
    }
  ]
])

const bubbleToolbarItems: ArrayOrNested<EditorToolbarItem<EditorCustomHandlers>> = [
  [
    { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold', tooltip: { text: 'Pogrubienie' } },
    { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic', tooltip: { text: 'Kursywa' } },
    { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline', tooltip: { text: 'Podkreślenie' } },
    { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough', tooltip: { text: 'Przekreślenie' } },
    { kind: 'mark', mark: 'code', icon: 'i-lucide-code', tooltip: { text: 'Kod' } }
  ],
  [
    { kind: 'link', icon: 'i-lucide-link', tooltip: { text: 'Link' } }
  ]
]
</script>

<template>
  <div class="w-full space-y-4">
    <ClientOnly>
      <UEditor
        ref="editorRef"
        v-slot="{ editor }"
        :model-value="modelValue"
        content-type="markdown"
        class="w-full min-h-100"
        :placeholder="placeholder"
        :extensions="[completionExtension]"
        :handlers="customHandlers"
        :editor-props="editorProps"
        @update:model-value="emit('update:modelValue', $event)"
      >
        <UEditorDragHandle :editor="editor" />
        <UEditorSuggestionMenu
          :editor="editor"
          :items="(suggestionItems as any)"
        />

        <UEditorToolbar
          :editor="editor"
          :items="fixedToolbarItems"
          layout="fixed"
          class="sticky top-0 z-10 bg-default sm:px-8 border-b border-default"
        />

        <UEditorToolbar
          :editor="editor"
          :items="bubbleToolbarItems"
          layout="bubble"
          :should-show="({ editor: e, view }) => {
            const { selection } = e.state
            return view.hasFocus() && !selection.empty && !e.isActive('image')
          }"
        />
      </UEditor>
      <template #fallback>
        <div class="w-full min-h-100 border border-default rounded-lg p-4 flex items-center justify-center">
          <UIcon
            name="i-lucide-loader-2"
            class="w-8 h-8 animate-spin text-primary"
          />
        </div>
      </template>
    </ClientOnly>

    <UModal
      v-model:open="showMediaModal"
      title="Wybierz obraz z biblioteki"
      :ui="{ content: 'w-full max-w-4xl' }"
    >
      <template #content>
        <div class="p-4">
          <MediaGrid
            :items="imageItems"
            :loading="loadingImages"
            @select="handleMediaSelect"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
