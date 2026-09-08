import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TCheckbox from '../../components/forms/TCheckbox.vue'

describe('TCheckbox', () => {
  it('émet true quand coché (mode booléen)', async () => {
    const wrapper = mount(TCheckbox, { props: { modelValue: false } })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
  })
  it('émet false quand décoché', async () => {
    const wrapper = mount(TCheckbox, { props: { modelValue: true } })
    await wrapper.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })
  it('ajoute la valeur au tableau (mode groupe)', async () => {
    const wrapper = mount(TCheckbox, { props: { modelValue: ['a'], value: 'b' } })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])
  })
  it('retire la valeur si déjà présente', async () => {
    const wrapper = mount(TCheckbox, { props: { modelValue: ['a'], value: 'a' } })
    await wrapper.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])
  })
  it("reflète l'état coché en mode groupe", () => {
    const wrapper = mount(TCheckbox, { props: { modelValue: ['a'], value: 'a' } })
    expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true)
  })
  it('désactivé via disabled', () => {
    const wrapper = mount(TCheckbox, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
