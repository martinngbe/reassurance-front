import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { useTheme } from '../../theme/useTheme'

describe('useTheme', () => {
  it('setPrimary met à jour la couleur et les variables CSS', async () => {
    const { theme, setPrimary } = useTheme()
    setPrimary('#eab308')
    await nextTick()
    expect(theme.primary).toBe('#eab308')
    expect(document.documentElement.style.getPropertyValue('--tw-primary-500')).not.toBe('')
  })

  it('setMode dark ajoute la classe dark', async () => {
    const { setMode } = useTheme()
    setMode('dark')
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('setMode light retire la classe dark', async () => {
    const { setMode } = useTheme()
    setMode('light')
    await nextTick()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggleMode bascule', async () => {
    const { theme, setMode, toggleMode } = useTheme()
    setMode('light')
    await nextTick()
    toggleMode()
    await nextTick()
    expect(theme.resolvedMode).toBe('dark')
  })
})
