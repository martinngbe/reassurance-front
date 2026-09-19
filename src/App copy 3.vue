<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useTheme } from './theme/useTheme'
import type {
  CheckboxModel,
  Option,
  OptionValue,
  TableColumn,
  TableRow,
  SortState,
  ZoneConfig,
} from './components/forms/common'

// ==================== THÈME ====================
import ThemePicker from './components/theme/ThemePicker.vue'
import ThemeModeToggle from './components/theme/ThemeModeToggle.vue'
import ToggleTheme from './components/theme/ToggleTheme.vue'

// ==================== LAYOUT ====================
import TLayout from './components/layout/TLayout.vue'

// ==================== FORMULAIRE (Phase A) ====================
import TButton from './components/forms/TButton.vue'
import TInput from './components/forms/TInput.vue'
import TTextarea from './components/forms/TTextarea.vue'
import TSelect from './components/forms/TSelect.vue'
import TCheckbox from './components/forms/TCheckbox.vue'
import TRadioGroup from './components/forms/TRadioGroup.vue'
import TSwitch from './components/forms/TSwitch.vue'
import TFileInput from './components/forms/TFileInput.vue'

// ==================== AFFICHAGE (Phase B + C) ====================
import TBadge from './components/display/TBadge.vue'
import TCard from './components/display/TCard.vue'
import TAlert from './components/display/TAlert.vue'
import TTable from './components/display/TTable.vue'
import TModal from './components/display/TModal.vue'
import TToolTip from './components/display/TToolTip.vue'

const { theme } = useTheme()

// ==================== LAYOUT ZONES ====================
const headerVisible = ref(true)
const leftVisible = ref(true)
const rightVisible = ref(true)
const footerVisible = ref(true)

const headerZone: ZoneConfig = { size: '60px', minSize: '48px' }
const leftZone: ZoneConfig = { size: '20%', minSize: '180px' }
const rightZone: ZoneConfig = { size: '250px', fixed: true }
const footerZone: ZoneConfig = { size: '40px', minSize: '36px' }

const authenticated = ref(false)
//const theme = ref<Theme>('dark')
const accentColor = ref('#6C5CE7')

function handleLogin() {
  authenticated.value = true
}

function handleLogout() {
  authenticated.value = false
}
</script>

<template>
  <!-- Plus besoin de :class="{ dark: ... }" ici, c'est géré sur <html> -->
  <div class="min-h-screen">
    <Login
      v-if="!authenticated"
      :theme="theme"
      :accent-color="accentColor"
      @submit="handleLogin"
    />
    <EcranPrincipal
      v-else
      :theme="theme"
      :accent-color="accentColor"
      :palettes="palettes"
      @logout="handleLogout"
      @update:theme="theme = $event"
      @update:accent-color="accentColor = $event"
    />
  </div>
</template>
