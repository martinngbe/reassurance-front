import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TButton from '../../components/forms/TButton.vue'

describe('TButton', () => {
  it('affiche le contenu du slot', () => {
    const wrapper = mount(TButton, { slots: { default: 'Valider' } })
    expect(wrapper.text()).toContain('Valider')
  })
  it('variante solid par défaut', () => {
    expect(mount(TButton).classes()).toContain('bg-primary-500')
  })
  it('variante outline', () => {
    expect(mount(TButton, { props: { variant: 'outline' } }).classes()).toContain('border')
  })
  it('taille lg', () => {
    expect(mount(TButton, { props: { size: 'lg' } }).classes()).toContain('h-12')
  })
  it('block prend toute la largeur', () => {
    expect(mount(TButton, { props: { block: true } }).classes()).toContain('w-full')
  })
  it('désactivé via disabled', () => {
    expect(mount(TButton, { props: { disabled: true } }).attributes('disabled')).toBeDefined()
  })
  it('spinner + désactivé en loading', () => {
    const wrapper = mount(TButton, { props: { loading: true } })
    expect(wrapper.find('.animate-spin').exists()).toBe(true)
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
  it('déclenche onClick quand actif', async () => {
    const onClick = vi.fn()
    const wrapper = mount(TButton, { attrs: { onClick } })
    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  it('ne déclenche pas onClick quand disabled', async () => {
    const onClick = vi.fn()
    const wrapper = mount(TButton, { props: { disabled: true }, attrs: { onClick } })
    await wrapper.trigger('click')
    expect(onClick).not.toHaveBeenCalled()
  })
})
