import type { App, Component, Plugin } from 'vue'
import ToggleTheme from './components/theme/ToggleTheme.vue' // ⬅️ import
// Style (sera extrait en dist/style.css au build)
import './assets/tailwind.css'

// Composants formulaire
import TButton from './components/forms/TButton.vue'
import TInput from './components/forms/TInput.vue'
import TTextarea from './components/forms/TTextarea.vue'
import TSelect from './components/forms/TSelect.vue'
import TCheckbox from './components/forms/TCheckbox.vue'
import TRadio from './components/forms/TRadio.vue'
import TRadioGroup from './components/forms/TRadioGroup.vue'
import TSwitch from './components/forms/TSwitch.vue'
import TFileInput from './components/forms/TFileInput.vue'
import TFieldWrapper from './components/forms/TFieldWrapper.vue'

// Thème
import ThemePicker from './components/theme/ThemePicker.vue'
import ThemeModeToggle from './components/theme/ThemeModeToggle.vue'

// Composants affichage (Phase B)
import TBadge from './components/display/TBadge.vue'
import TCard from './components/display/TCard.vue'
import TAlert from './components/display/TAlert.vue'
import TTable from './components/display/TTable.vue'
import TModal from './components/display/TModal.vue'

const components: Record<string, Component> = {
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
    for (const [name, component] of Object.entries(components)) {
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
export * from './components/forms/common'
