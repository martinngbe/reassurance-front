import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TRadioGroup from '../../components/forms/TRadioGroup.vue'

const options = [
  { value: 'm', label: 'Monsieur' },
  { value: 'f', label: 'Madame' },
]

describe('TRadioGroup', () => {
  it('rend un radio par option', () => {
    const wrapper = mount(TRadioGroup, { props: { options } })
    expect(wrapper.findAll('input[type=radio]')).toHaveLength(2)
  })

  it('émet la valeur sélectionnée', async () => {
    const wrapper = mount(TRadioGroup, { props: { options } })
    await wrapper.findAll('input[type=radio]')[1].setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['f'])
  })

  it('coche le radio correspondant à modelValue', () => {
    const wrapper = mount(TRadioGroup, { props: { options, modelValue: 'm' } })
    const radios = wrapper.findAll('input[type=radio]')
    expect((radios[0].element as HTMLInputElement).checked).toBe(true)
    expect((radios[1].element as HTMLInputElement).checked).toBe(false)
  })

  it('passe en disposition inline', () => {
    const wrapper = mount(TRadioGroup, { props: { options, inline: true } })
    expect(wrapper.find('[role=radiogroup]').classes()).toContain('flex')
  })
})
