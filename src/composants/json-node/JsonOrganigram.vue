<template>
  <div :class="['json-organigram', { dark: isDark }]">
    <!-- Header -->
    <div class="organigram-header">
      <div class="header-title">
        <div class="title-icon">◆</div>
        <span>JSON Organigram</span>
      </div>
      <div class="header-actions">
        <button class="icon-btn" @click="toggleTheme" :title="isDark ? 'Mode clair' : 'Mode sombre'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button class="icon-btn" @click="fitViewAction" title="Ajuster la vue">⊡</button>
        <button class="icon-btn" @click="expandAll" title="Tout déplier">⊞</button>
        <button class="icon-btn" @click="collapseAll" title="Tout plier">⊟</button>
        <div class="node-count">{{ nodes.length }} nœuds</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">Construction du graphe...</div>
    </div>

    <!-- Flow -->
    <VueFlow
      v-else
      v-model:nodes="nodes"
      v-model:edges="edges"
      :default-viewport="{ zoom: 1, x: 0, y: 0 }"
      :min-zoom="0.1"
      :max-zoom="4"
      :fit-view-on-init="true"
      :only-render-visible-elements="true"
      :nodes-connectable="false"
      :nodes-draggable="true"
      :zoom-on-scroll="true"
      :pan-on-scroll="true"
      :pan-on-scroll-speed="0.5"
      class="vue-flow-container"
    >
      <template #node-custom="nodeProps">
        <JsonNode
          :data="nodeProps.data"
          :selected="nodeProps.selected"
          @toggle="toggleNode"
        />
      </template>
      <Background :gap="20" :size="1" :pattern-color="isDark ? '#ffffff10' : '#00000010'" />
      <Controls position="bottom-right" />
      <MiniMap
        :node-color="(n: any) => n.data?.color?.bg || '#6366f1'"
        :mask-color="isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)'"
        position="bottom-left"
        :width="180"
        :height="120"
      />
    </VueFlow>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import dagre from 'dagre'
import JsonNode from './JsonNode.vue'

const props = defineProps({
  jsonData: { type: [String, Object], required: true }
})

const nodes = ref<any[]>([])
const edges = ref<any[]>([])
const loading = ref(false)
const isDark = ref(true)
const collapsedNodes = ref<Set<string>>(new Set())
const allNodeIds = ref<string[]>([]) // Pour expand/collapse all

const { fitView } = useVueFlow()

function toggleTheme() {
  isDark.value = !isDark.value
}

function fitViewAction() {
  fitView({ padding: 0.2 })
}

function expandAll() {
  collapsedNodes.value.clear()
  rebuildVisibleGraph()
}

function collapseAll() {
  // On plie tous les nœuds qui ont des enfants (sauf la racine)
  collapsedNodes.value = new Set(
    allNodeIds.value.filter(id => id !== 'node-0')
  )
  rebuildVisibleGraph()
}

// Palette de couleurs par profondeur
const depthColors = [
  { bg: '#6366f1', border: '#818cf8' }, // indigo
  { bg: '#8b5cf6', border: '#a78bfa' }, // violet
  { bg: '#ec4899', border: '#f472b6' }, // pink
  { bg: '#f59e0b', border: '#fbbf24' }, // amber
  { bg: '#10b981', border: '#34d399' }, // emerald
  { bg: '#06b6d4', border: '#22d3ee' }  // cyan
]

// --- Layout automatique avec Dagre ---
function getLayoutedElements(treeNodes: any[], treeEdges: any[], direction = 'TB') {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 })

  treeNodes.forEach((node) => {
    g.setNode(node.id, { width: 220, height: 110 })
  })

  treeEdges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  treeNodes.forEach((node) => {
    const position = g.node(node.id)
    node.position = {
      x: position.x - 110, // width / 2
      y: position.y - 55   // height / 2
    }
  })

  return { nodes: treeNodes, edges: treeEdges }
}

// --- Gestion Collapse/Expand ---
function toggleNode(nodeId: string) {
  if (collapsedNodes.value.has(nodeId)) {
    collapsedNodes.value.delete(nodeId)
  } else {
    collapsedNodes.value.add(nodeId)
  }
  rebuildVisibleGraph()
}

// --- Construction du graphe filtré ---
function rebuildVisibleGraph() {
  const visibleNodes: any[] = []
  const visibleEdges: any[] = []
  let nodeId = 0
  const objectToId = new WeakMap<object, string>()

  function buildAndFilter(obj: any, depth = 0, parentId: string | null = null) {
    const currentId = `node-${nodeId++}`
    const color = depthColors[depth % depthColors.length]
    const isCollapsed = collapsedNodes.value.has(currentId)

    // Identifier les enfants objets
    const childKeys =
      typeof obj === 'object' && obj !== null
        ? Object.keys(obj).filter(k => {
            const v = obj[k]
            return typeof v === 'object' && v !== null
          })
        : []
    const childCount = childKeys.length

    const nodeData = {
      id: currentId,
      type: 'custom',
      data: {
        label: formatLabel(obj),
        color,
        depth,
        childCount,
        collapsed: isCollapsed,
        fullJson: typeof obj === 'object' && obj !== null
          ? JSON.stringify(obj, null, 2)
          : String(obj)
      }
    }

    visibleNodes.push(nodeData)

    if (typeof obj === 'object' && obj !== null) {
      objectToId.set(obj, currentId)
    }

    if (parentId) {
      visibleEdges.push({
        id: `edge-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
        type: 'smoothstep',
        style: {
          stroke: color?.border,
          strokeWidth: 2
        },
        animated: depth === 0
      })
    }

    // Si pas plié, on explore les enfants
    if (!isCollapsed && childCount > 0) {
      childKeys.forEach(key => {
        buildAndFilter(obj[key], depth + 1, currentId)
      })
    }
  }

  try {
    const parsedData = typeof props.jsonData === 'string'
      ? JSON.parse(props.jsonData)
      : props.jsonData

    buildAndFilter(parsedData)

    // Layout automatique
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      getLayoutedElements(visibleNodes, visibleEdges)

    nodes.value = layoutedNodes
    edges.value = layoutedEdges

    nextTick(() => fitView({ padding: 0.2 }))
  } catch (error) {
    console.error('Erreur JSON:', error)
    nodes.value = []
    edges.value = []
  }
}

// --- Formatage du label ---
function formatLabel(obj: any): string {
  if (typeof obj !== 'object' || obj === null) {
    return String(obj).substring(0, 40)
  }
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'
  const preview = entries.slice(0, 3).map(([k, v]) => {
    const value = typeof v === 'object'
      ? (Array.isArray(v) ? `[${v.length}]` : '{...}')
      : String(v).substring(0, 20)
    return `${k}: ${value}`
  })
  const suffix = entries.length > 3 ? `\n+${entries.length - 3} autres` : ''
  return preview.join('\n') + suffix
}

// --- Build initial ---
async function buildOrganigram() {
  loading.value = true
  collapsedNodes.value.clear()
  await nextTick()
  try {
    rebuildVisibleGraph()
  } catch (error) {
    console.error('Erreur:', error)
    nodes.value = []
    edges.value = []
  } finally {
    loading.value = false
  }
}

watch(() => props.jsonData, buildOrganigram, { immediate: true, deep: true })
</script>

<style scoped>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';
@import '@vue-flow/minimap/dist/style.css';

.json-organigram {
  width: 100%;
  height: 100%;
  position: relative;
  background: #0f172a;
  color: white;
  overflow: hidden;
  transition: background 0.3s;
}

.json-organigram:not(.dark) {
  background: #f8fafc;
  color: #0f172a;
}

.organigram-header {
  position: absolute;
  top: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
}

.json-organigram:not(.dark) .organigram-header {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(0, 0, 0, 0.08);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 15px;
}

.title-icon {
  color: #818cf8;
  font-size: 18px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: rgba(99, 102, 241, 0.3);
  transform: translateY(-1px);
}

.json-organigram:not(.dark) .icon-btn {
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

.node-count {
  font-size: 12px;
  padding: 4px 12px;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 10px;
  color: #a5b4fc;
  font-weight: 600;
}

.vue-flow-container {
  width: 100%;
  height: 100%;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #818cf8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}
</style>