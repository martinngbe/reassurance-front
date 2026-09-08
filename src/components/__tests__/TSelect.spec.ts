import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TSelect from '../../components/forms/TSelect.vue'

const options = [
  { value: 'fr', label: 'France' },
  { value: 'be', label: 'Belgique' },
]

describe('TSelect', () => {
  it('rend les options + le placeholder', () => {
    const wrapper = mount(TSelect, { props: { options } })
    const opts = wrapper.findAll('select option')
    expect(opts).toHaveLength(3) // placeholder + 2
    expect(opts[1].text()).toBe('France')
  })

  it('accepte un tableau de valeurs brutes', () => {
    const wrapper = mount(TSelect, { props: { options: ['a', 'b'], placeholder: '' } })
    const opts = wrapper.findAll('select option')
    expect(opts).toHaveLength(2)
    expect(opts[0].text()).toBe('a')
  })

  it('émet update:modelValue au changement', async () => {
    const wrapper = mount(TSelect, { props: { options } })
    await wrapper.find('select').setValue('fr')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['fr'])
  })

  it('bordure rouge en erreur', () => {
    const wrapper = mount(TSelect, { props: { options, error: 'X' } })
    expect(wrapper.find('select').classes()).toContain('border-red-400')
  })

  it('désactivé via disabled', () => {
    const wrapper = mount(TSelect, { props: { options, disabled: true } })
    expect(wrapper.find('select').attributes('disabled')).toBeDefined()
  })
})
