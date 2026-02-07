<script setup lang="ts">
/**
 * Renderuje HTML przez komponenty Prose z app/components/content.
 * Używane do treści bloga (bodyHtml) i wszędzie tam, gdzie chcemy spójny wygląd prose.
 */
import ContentProseNode from './ContentProseNode.vue'
import type { ProseNode } from './ContentProseNode.vue'

const props = defineProps<{
  html: string
}>()

const tree = ref<ProseNode[]>([])

function getAttrs(el: Element): Record<string, string> {
  const attrs: Record<string, string> = {}
  const want = ['id', 'href', 'src', 'alt', 'width', 'height', 'class']
  for (const name of want) {
    const v = el.getAttribute(name)
    if (v) attrs[name] = v
  }
  return attrs
}

function parseNode(node: ChildNode): string | ProseNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').trim() ? node.textContent ?? '' : ''
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return ''
  const el = node as Element
  const tag = el.tagName.toLowerCase()
  const attrs = getAttrs(el)
  const children = Array.from(el.childNodes)
    .map(parseNode)
    .filter(c => c !== '')
  return { tag, attrs, children }
}

function parseHtml(html: string): ProseNode[] {
  if (typeof document === 'undefined') return []
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body
  const nodes: ProseNode[] = []
  for (const node of body.childNodes) {
    const parsed = parseNode(node)
    if (typeof parsed === 'object' && parsed.children.length >= 0) {
      nodes.push(parsed)
    } else if (typeof parsed === 'string' && parsed) {
      nodes.push({ tag: 'p', attrs: {}, children: [parsed] })
    }
  }
  return nodes
}

function updateTree() {
  if (typeof document === 'undefined') return
  tree.value = props.html ? parseHtml(props.html) : []
}

onMounted(updateTree)

watch(() => props.html, updateTree)
</script>

<template>
  <div class="content-prose-html">
    <ContentProseNode
      v-for="(node, i) in tree"
      :key="i"
      :node="node"
    />
  </div>
</template>
