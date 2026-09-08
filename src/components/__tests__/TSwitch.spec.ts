import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TSwitch from '../../components/forms/TSwitch.vue'

describe('TSwitch', () => {
  it('émet true au clic quand éteint', async () => {
    const wrapper = mount(TSwitch, { props: { modelValue: false } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
  it('émet false au clic quand allumé', async () => {
    const wrapper = mount(TSwitch, { props: { modelValue: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
  it('a le bon rôle ARIA', () => {
    const wrapper = mount(TSwitch, { props: { modelValue: true } })
    expect(wrapper.find('button').attributes('role')).toBe('switch')
    expect(wrapper.find('button').attributes('aria-checked')).toBe('true')
  })
  it("n'émet pas quand disabled", async () => {
    const wrapper = mount(TSwitch, { props: { modelValue: false, disabled: true } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
