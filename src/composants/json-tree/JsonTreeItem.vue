<template>
  <div class="tree-node">
    <div class="node-header" @click="toggle">
      <!-- Icône d'expansion -->
      <span v-if="isExpandable" class="toggle-icon">{{ isOpen ? '▼' : '▶' }}</span>
      <span v-else class="toggle-icon placeholder"></span>

      <!-- Clé (nom de la propriété) -->
      <span class="node-key">{{ name }}:</span>

      <!-- Valeur (si c'est un type primitif) -->
      <span v-if="!isExpandable" class="node-value" :class="'type-' + valueType">
        {{ formattedValue }}
      </span>

      <!-- Type (si c'est un objet ou tableau) -->
      <span v-else class="node-type">
        {{ displayType }}
      </span>
    </div>

    <!-- Enfants (récursion) -->
    <div v-if="isExpandable && isOpen" class="node-children">
      <template v-if="isArray">
        <JsonTreeItem
          v-for="(item, index) in data"
          :key="index"
          :data="item"
          :name="index"
          :depth="depth + 1"
        />
      </template>
      <template v-else>
        <JsonTreeItem
          v-for="(value, key) in data"
          :key="key"
          :data="value"
          :name="key"
          :depth="depth + 1"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

defineOptions({ name: 'JsonTreeItem' })

const props = defineProps({
  data: { type: [Object, Array, String, Number, Boolean], required: true },
  name: { type: [String, Number], required: true },
  depth: { type: Number, default: 0 }
})

//const isOpen = ref(props.depth < 2)
// ✅ MODIFICATION ICI : On ouvre uniquement le nœud racine (depth === 0)
const isOpen = ref(props.depth === 0)

const isArray = computed(() => Array.isArray(props.data))
const isObject = computed(() => props.data !== null && typeof props.data === 'object')
const isExpandable = computed(() => isArray.value || isObject.value)

const displayType = computed(() => {
  if (Array.isArray(props.data)) {
    return `Array(${props.data.length})`
  }
  if (props.data !== null && typeof props.data === 'object') {
    return `Object{${Object.keys(props.data).length}}`
  }
  return ''
})

const valueType = computed(() => {
  if (props.data === null) return 'null'
  if (isArray.value) return 'array'
  return typeof props.data
})

const formattedValue = computed(() => {
  if (props.data === null) return 'null'
  if (typeof props.data === 'string') return `"${props.data}"`
  return String(props.data)
})

const toggle = () => {
  if (isExpandable.value) isOpen.value = !isOpen.value
}
</script>

<style scoped>
.tree-node {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.node-header {
  cursor: pointer;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 4px;
  transition: background 0.1s;
}

.node-header:hover {
  background-color: var(--tree-hover-bg, #f0f4f8);
}

.toggle-icon {
  width: 12px;
  font-size: 10px;
  color: var(--tree-icon-color, #666);
  text-align: center;
  flex-shrink: 0;
}

.placeholder { visibility: hidden; }

.node-key {
  color: var(--tree-key-color, #881391);
  font-weight: 600;
}

.node-value { color: var(--tree-value-color, #333); }
.type-string { color: var(--tree-string-color, #0b7575); }
.type-number { color: var(--tree-number-color, #1c00cf); }
.type-boolean { color: var(--tree-boolean-color, #aa0d91); }
.type-null { color: var(--tree-null-color, #808080); font-style: italic; }

.node-type {
  color: var(--tree-type-color, #808080);
  font-style: italic;
  font-size: 12px;
}

.node-children {
  border-left: 1px dashed var(--tree-border-color, #cbd5e1);
  margin-left: 6px;
  padding-left: 12px;
}
</style>