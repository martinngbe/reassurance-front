// types/contextMenu.ts
export type MenuItemType = 'item' | 'separator';

export interface MenuItem {
  type?: MenuItemType;
  icon?: string;
  label?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  action?: () => void;
  children?: MenuItem[]; // Pour les sous-menus (optionnel)
}

export interface MenuPosition {
  x: number;
  y: number;
}