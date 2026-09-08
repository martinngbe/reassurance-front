import { reactive, watch } from 'vue'
import { contrastColor, generatePalette, hexToRgb } from './palette'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedMode = 'light' | 'dark'

export interface ThemeState {
  primary: string
  mode: ThemeMode
  /** mode réellement appliqué ('system' résolu en light/dark) */
  resolvedMode: ResolvedMode
}

const COLOR_KEY = 'theme:primary'
const MODE_KEY = 'theme:mode'
const DEFAULT_COLOR = '#6366f1'
const DEFAULT_MODE: ThemeMode = 'system'

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}
function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignore */
  }
}
function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
}
function resolveMode(mode: ThemeMode): ResolvedMode {
  return mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode
}

const storedMode = safeGet(MODE_KEY)
const theme = reactive<ThemeState>({
  primary: safeGet(COLOR_KEY) ?? DEFAULT_COLOR,
  mode:
    storedMode === 'light' || storedMode === 'dark' || storedMode === 'system'
      ? storedMode
      : DEFAULT_MODE,
  resolvedMode: 'light',
})

function applyPrimary(hex: string): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const palette = generatePalette(hex)
  for (const [shade, color] of Object.entries(palette)) {
    const { r, g, b } = hexToRgb(color)
    root.style.setProperty(`--tw-primary-${shade}`, `${r} ${g} ${b}`)
  }
  const c = hexToRgb(contrastColor(hex))
  root.style.setProperty('--tw-primary-contrast', `${c.r} ${c.g} ${c.b}`)
  safeSet(COLOR_KEY, hex)
}

function applyMode(mode: ThemeMode): void {
  theme.resolvedMode = resolveMode(mode)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme.resolvedMode === 'dark')
  }
  safeSet(MODE_KEY, mode)
}

watch(() => theme.primary, applyPrimary, { immediate: true })
watch(() => theme.mode, applyMode, { immediate: true })

// Suit les préférences système quand mode === 'system'
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.mode === 'system') applyMode('system')
  })
}

export interface UseThemeReturn {
  theme: ThemeState
  setPrimary: (hex: string) => void
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

export function useTheme(): UseThemeReturn {
  const setPrimary = (hex: string): void => {
    theme.primary = hex
  }
  const setMode = (mode: ThemeMode): void => {
    theme.mode = mode
  }
  const toggleMode = (): void => {
    theme.mode = theme.resolvedMode === 'dark' ? 'light' : 'dark'
  }
  return { theme, setPrimary, setMode, toggleMode }
}
