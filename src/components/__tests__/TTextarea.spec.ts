import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TTextarea from '../../components/forms/TTextarea.vue'

describe('TTextarea', () => {
  it('affiche la valeur', () => {
    const wrapper = mount(TTextarea, { props: { modelValue: 'hello' } })
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('hello')
  })
  it('émet à la saisie', async () => {
    const wrapper = mount(TTextarea)
    await wrapper.find('textarea').setValue('texte')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['texte'])
  })
  it('respecte rows', () => {
    const wrapper = mount(TTextarea, { props: { rows: 6 } })
    expect(wrapper.find('textarea').attributes('rows')).toBe('6')
  })
  it('bordure rouge en erreur', () => {
    const wrapper = mount(TTextarea, { props: { error: 'X' } })
    expect(wrapper.find('textarea').classes()).toContain('border-red-400')
  })
})
