import type { App, Component, Plugin } from 'vue'
import ToggleTheme from './composants/theme/ToggleTheme.vue' // ⬅️ import
// Style (sera extrait en dist/style.css au build)
import './assets/tailwind.css'

// Composants formulaire
import TButton from './composants/forms/TButton.vue'
import TInput from './composants/forms/TInput.vue'
import TTextarea from './composants/forms/TTextarea.vue'
import TSelect from './composants/forms/TSelect.vue'
import TCheckbox from './composants/forms/TCheckbox.vue'
import TRadio from './composants/forms/TRadio.vue'
import TRadioGroup from './composants/forms/TRadioGroup.vue'
import TSwitch from './composants/forms/TSwitch.vue'
import TFileInput from './composants/forms/TFileInput.vue'
import TFieldWrapper from './composants/forms/TFieldWrapper.vue'

// Thème
import ThemePicker from './composants/theme/ThemePicker.vue'
import ThemeModeToggle from './composants/theme/ThemeModeToggle.vue'

// Composants affichage (Phase B)
import TBadge from './composants/display/TBadge.vue'
import TCard from './composants/display/TCard.vue'
import TAlert from './composants/display/TAlert.vue'
import TTable from './composants/display/TTable.vue'
import TModal from './composants/display/TModal.vue'

const composants: Record<string, Component> = {
  TButton,
  TInput,
  TTextarea,
  TSelect,
  TCheckbox,
  TRadio,
  TRadioGroup,
  TSwitch,
  TFileInput,
  TFieldWrapper,
  ThemePicker,
  ThemeModeToggle,
  ToggleTheme,
  TBadge,
  TCard,
  TAlert,
  TTable,
  TModal,
}

export {
  TButton,
  TInput,
  TTextarea,
  TSelect,
  TCheckbox,
  TRadio,
  TRadioGroup,
  TSwitch,
  TFileInput,
  TFieldWrapper,
  ThemePicker,
  ThemeModeToggle,
  ToggleTheme,
  TBadge,
  TCard,
  TAlert,
  TTable,
  TModal,
}

/** Installation globale : `app.use(UiKit)` */
export const UiKit: Plugin = {
  install(app: App): void {
    for (const [name, component] of Object.entries(composants)) {
      app.component(name, component)
    }
  },
}

export default UiKit

// Thème + helpers + types
export { useTheme } from './theme/useTheme'
export type { ThemeState, ThemeMode, ResolvedMode, UseThemeReturn } from './theme/useTheme'
export {
  generatePalette,
  contrastColor,
  relativeLuminance,
  hexToRgb,
  rgbToHex,
} from './theme/palette'
export type { Palette, Rgb, Shade } from './theme/palette'
export * from './composants/forms/common'
