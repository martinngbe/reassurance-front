// composables/useContextMenu.ts
import { ref, type Ref } from 'vue';
import type { MenuItem, MenuPosition } from './contextMenu';

// État global partagé (singleton)
const visible: Ref<boolean> = ref(false);
const items: Ref<MenuItem[]> = ref([]);
const position: Ref<MenuPosition> = ref({ x: 0, y: 0 });

export function useContextMenu() {
  const open = (event: MouseEvent, menuItems: MenuItem[]): void => {
    event.preventDefault();
    event.stopPropagation();
    
    position.value = { x: event.clientX, y: event.clientY };
    items.value = menuItems;
    visible.value = true;
  };

  const close = (): void => {
    visible.value = false;
  };

  return { 
    visible, 
    items, 
    position, 
    open, 
    close 
  };
}