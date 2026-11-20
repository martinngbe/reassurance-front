<!-- components/ContextMenu.vue -->
<template>
  <Teleport to="body">
    <Transition name="ctx-fade">
      <div 
        v-if="visible"
        ref="menuRef"
        class="context-menu"
        :style="positionStyle"
        @click.stop
      >
        <template v-for="(item, index) in items" :key="index">
          <!-- Séparateur -->
          <div v-if="item.type === 'separator'" class="ctx-separator"></div>
          
          <!-- Item normal -->
          <div 
            v-else
            class="ctx-item"
            :class="{ 
              'ctx-item--disabled': item.disabled,
              'ctx-item--danger': item.danger 
            }"
            @click="handleClick(item)"
          >
            <span class="ctx-indicator"></span>
            <span class="ctx-label">{{ item.label }}</span>
            <span v-if="item.shortcut" class="ctx-shortcut">{{ item.shortcut }}</span>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { MenuItem, MenuPosition } from './contextMenu';
//import type { MenuItem, MenuPosition } from '@/types/contextMenu';

interface Props {
  items: MenuItem[];
  position: MenuPosition;
  visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  position: () => ({ x: 0, y: 0 }),
  visible: false
});

const emit = defineEmits<{
  (e: 'select', item: MenuItem): void;
  (e: 'close'): void;
}>();

const menuRef = ref<HTMLDivElement | null>(null);
const adjustedPos = ref<MenuPosition>({ x: 0, y: 0 });

const positionStyle = computed(() => ({
  top: `${adjustedPos.value.y}px`,
  left: `${adjustedPos.value.x}px`
}));

const adjustPosition = async (): Promise<void> => {
  await nextTick();
  if (!menuRef.value) return;
  
  const rect = menuRef.value.getBoundingClientRect();
  const { innerWidth, innerHeight } = window;
  let { x, y } = props.position;
  
  if (x + rect.width > innerWidth) x = innerWidth - rect.width - 8;
  if (y + rect.height > innerHeight) y = innerHeight - rect.height - 8;
  if (x < 0) x = 8;
  if (y < 0) y = 8;
  
  adjustedPos.value = { x, y };
};

const handleClick = (item: MenuItem): void => {
  if (item.disabled) return;
  emit('select', item);
  emit('close');
};

const handleGlobalClick = (): void => emit('close');
const handleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') emit('close');
};

onMounted(() => {
  window.addEventListener('click', handleGlobalClick);
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('click', handleGlobalClick);
  window.removeEventListener('keydown', handleKeydown);
});

watch(() => props.visible, (v) => v && adjustPosition());
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: var(--ctx-bg);
  border: 1px solid var(--ctx-border);
  border-radius: 8px;
  box-shadow: var(--ctx-shadow);
  z-index: 9999;
  min-width: 180px;
  padding: 6px 0;
  font-size: 14px;
  color: var(--ctx-text);
  backdrop-filter: blur(8px);
}

.ctx-item {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  color: var(--ctx-text);
  gap: 12px;
  transition: all 0.15s ease;
  position: relative;
}

.ctx-item:hover:not(.ctx-item--disabled) {
  background-color: var(--ctx-hover);
}

.ctx-item:hover:not(.ctx-item--disabled) .ctx-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.ctx-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 3px;
  height: 60%;
  background: var(--ctx-primary);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: all 0.2s ease;
}

.ctx-item--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ctx-item--danger {
  color: var(--ctx-danger);
}

.ctx-item--danger:hover:not(.ctx-item--disabled) {
  background-color: var(--ctx-danger-hover);
}

.ctx-item--danger:hover:not(.ctx-item--disabled) .ctx-indicator {
  background: var(--ctx-danger);
}

.ctx-label {
  flex: 1;
  font-weight: 500;
}

.ctx-shortcut {
  font-size: 12px;
  color: var(--ctx-text-muted);
  font-family: monospace;
}

.ctx-separator {
  height: 1px;
  background: var(--ctx-separator);
  margin: 6px 0;
}

.ctx-fade-enter-active,
.ctx-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.ctx-fade-enter-from,
.ctx-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>