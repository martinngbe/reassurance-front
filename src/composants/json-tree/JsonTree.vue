<template>
  <div class="json-tree-container" :class="{ dark: isDark }">
    <div class="tree-header">
      <h3 class="tree-title">Arbre JSON</h3>
      <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Mode clair' : 'Mode sombre'">
        {{ isDark ? '☀️' : '🌙' }}
      </button>
    </div>
    <JsonTreeItem :data="jsonData" name="root" :depth="0" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JsonTreeItem from './JsonTreeItem.vue'

defineProps({
  jsonData: {
    type: [Object, Array],
    required: true
  }
})

// Détection du thème système
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const isDark = ref(prefersDark)

const toggleTheme = () => {
  isDark.value = !isDark.value
}
</script>

<style scoped>
.json-tree-container {
  background-color: var(--tree-bg, #ffffff);
  border: 1px solid var(--tree-border, #e2e8f0);
  border-radius: 8px;
  padding: 16px;
  max-height: 600px;
  overflow: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: background-color 0.3s, border-color 0.3s;
}

/* Thème sombre */
.json-tree-container.dark {
  --tree-bg: #1e1e1e;
  --tree-border: #3e3e3e;
  --tree-hover-bg: #2d2d2d;
  --tree-icon-color: #9ca3af;
  --tree-key-color: #c084fc;
  --tree-value-color: #e5e7eb;
  --tree-string-color: #5eead4;
  --tree-number-color: #60a5fa;
  --tree-boolean-color: #f472b6;
  --tree-null-color: #6b7280;
  --tree-type-color: #9ca3af;
  --tree-border-color: #4b5563;
}

/* Thème clair (défaut) */
.json-tree-container:not(.dark) {
  --tree-bg: #ffffff;
  --tree-border: #e2e8f0;
  --tree-hover-bg: #f0f4f8;
  --tree-icon-color: #666;
  --tree-key-color: #881391;
  --tree-value-color: #333;
  --tree-string-color: #0b7575;
  --tree-number-color: #1c00cf;
  --tree-boolean-color: #aa0d91;
  --tree-null-color: #808080;
  --tree-type-color: #808080;
  --tree-border-color: #cbd5e1;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--tree-border);
}

.tree-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--tree-value-color);
}

.theme-toggle {
  background: none;
  border: 1px solid var(--tree-border);
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;
}

.theme-toggle:hover {
  background-color: var(--tree-hover-bg);
}
</style>