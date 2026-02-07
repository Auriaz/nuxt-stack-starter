<script setup lang="ts">
/**
 * Jeden węzeł drzewa HTML → render przez komponent Prose (lub natywny tag).
 */
import type { Component } from 'vue'
import ContentProseNode from './ContentProseNode.vue'
import ProseA from './ProseA.vue'
import ProseBlockquote from './ProseBlockquote.vue'
import ProseCode from './ProseCode.vue'
import ProseEm from './ProseEm.vue'
import ProseH1 from './ProseH1.vue'
import ProseH2 from './ProseH2.vue'
import ProseH3 from './ProseH3.vue'
import ProseH4 from './ProseH4.vue'
import ProseH5 from './ProseH5.vue'
import ProseH6 from './ProseH6.vue'
import ProseHr from './ProseHr.vue'
import ProseImg from './ProseImg.vue'
import ProseLi from './ProseLi.vue'
import ProseOl from './ProseOl.vue'
import ProseP from './ProseP.vue'
import ProsePre from './ProsePre.vue'
import ProseStrong from './ProseStrong.vue'
import ProseTable from './ProseTable.vue'
import ProseTbody from './ProseTbody.vue'
import ProseTd from './ProseTd.vue'
import ProseTh from './ProseTh.vue'
import ProseThead from './ProseThead.vue'
import ProseTr from './ProseTr.vue'
import ProseUl from './ProseUl.vue'

export interface ProseNode {
  tag: string
  attrs: Record<string, string>
  children: (string | ProseNode)[]
}

const PROSE_MAP: Record<string, Component> = {
  p: ProseP,
  h1: ProseH1,
  h2: ProseH2,
  h3: ProseH3,
  h4: ProseH4,
  h5: ProseH5,
  h6: ProseH6,
  a: ProseA,
  strong: ProseStrong,
  em: ProseEm,
  blockquote: ProseBlockquote,
  pre: ProsePre,
  code: ProseCode,
  ul: ProseUl,
  ol: ProseOl,
  li: ProseLi,
  hr: ProseHr,
  img: ProseImg,
  table: ProseTable,
  thead: ProseThead,
  tbody: ProseTbody,
  tr: ProseTr,
  th: ProseTh,
  td: ProseTd
}

defineProps<{
  node: ProseNode
}>()

function isProseNode(child: string | ProseNode): child is ProseNode {
  return typeof child === 'object' && child !== null && 'tag' in child
}
</script>

<template>
  <component
    :is="PROSE_MAP[node.tag] ?? node.tag"
    v-bind="node.attrs"
  >
    <template
      v-for="(child, i) in node.children"
      :key="i"
    >
      <ContentProseNode
        v-if="isProseNode(child)"
        :node="child"
      />
      <template v-else>
        {{ child }}
      </template>
    </template>
  </component>
</template>
