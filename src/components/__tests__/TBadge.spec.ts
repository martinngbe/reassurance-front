import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TBadge from '../../components/display/TBadge.vue'

describe('TBadge', () => {
  it('affiche le slot', () => {
    expect(mount(TBadge, { slots: { default: 'Actif' } }).text()).toContain('Actif')
  })
  it('variante soft primary par défaut', () => {
    expect(mount(TBadge).classes()).toContain('bg-primary-500/10')
  })
  it('variante solid danger', () => {
    const wrapper = mount(TBadge, { props: { variant: 'solid', color: 'danger' } })
    expect(wrapper.classes()).toContain('bg-red-600')
  })
  it('affiche la pastille avec dot', () => {
    expect(
      mount(TBadge, { props: { dot: true } })
        .find('.bg-primary-500')
        .exists(),
    ).toBe(true)
  })
  it('taille lg', () => {
    expect(mount(TBadge, { props: { size: 'lg' } }).classes()).toContain('px-2.5')
  })
})
