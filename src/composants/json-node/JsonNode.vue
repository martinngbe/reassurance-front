<template>
  <div
    :class="['json-node', { selected, collapsed: data.collapsed }]"
    :style="nodeStyle"
    :title="data.fullJson"
  >
    <div class="node-header">
      <span class="node-badge">{{ data.depth === 0 ? '●' : `L${data.depth}` }}</span>
      <div class="header-right">
        <span v-if="data.childCount > 0" class="node-count">{{ data.childCount }}</span>
        <button
          v-if="data.childCount > 0"
          class="toggle-btn"
          @click.stop="$emit('toggle', data.id)"
          :title="data.collapsed ? 'Déplier' : 'Plier'"
        >
          {{ data.collapsed ? '+' : '−' }}
        </button>
      </div>
    </div>
    <div class="node-content">
      <pre class="node-label">{{ data.label }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
  selected: { type: Boolean, default: false }
})

defineEmits(['toggle'])

const nodeStyle = computed(() => ({
  '--node-bg': props.data.color.bg,
  '--node-border': props.data.color.border
}))
</script>

<style scoped>
.json-node {
  min-width: 180px;
  max-width: 240px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 14px;
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: grab;
  position: relative;
  overflow: hidden;
}

.json-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--node-bg), var(--node-border));
}

.json-node:hover {
  transform: translateY(-2px);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.35),
    0 0 0 1px var(--node-border) inset;
}

.json-node.selected {
  border-color: var(--node-border);
  box-shadow:
    0 0 0 2px var(--node-border),
    0 12px 32px rgba(0, 0, 0, 0.4);
}

.json-node.collapsed {
  opacity: 0.85;
  border-style: dashed;
  border-color: var(--node-border);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--node-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.node-count {
  font-size: 10px;
  padding: 2px 8px;
  background: var(--node-bg);
  color: white;
  border-radius: 10px;
  font-weight: 600;
}

.toggle-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  padding: 0;
  line-height: 1;
}

.toggle-btn:hover {
  background: var(--node-bg);
  transform: scale(1.15);
  border-color: var(--node-border);
}

.node-content {
  color: rgba(255, 255, 255, 0.9);
}

.node-label {
  font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
  font-size: 11px;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 80px;
  overflow: hidden;
}
</style>