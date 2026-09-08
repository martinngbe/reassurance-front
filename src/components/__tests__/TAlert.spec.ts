import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TAlert from '../../components/display/TAlert.vue'

describe('TAlert', () => {
  it('a le rôle alert', () => {
    expect(mount(TAlert).attributes('role')).toBe('alert')
  })
  it('affiche titre et contenu', () => {
    const wrapper = mount(TAlert, { props: { title: 'Bravo' }, slots: { default: 'OK' } })
    expect(wrapper.text()).toContain('Bravo')
    expect(wrapper.text()).toContain('OK')
  })
  it('variante danger applique les classes rouges', () => {
    const wrapper = mount(TAlert, { props: { variant: 'danger' } })
    expect(wrapper.classes().join(' ')).toContain('border-red-500/30')
  })
  it('se ferme et émet close', async () => {
    const wrapper = mount(TAlert, { props: { closable: true } })
    await wrapper.find('button[aria-label="Fermer"]').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
  })
})
