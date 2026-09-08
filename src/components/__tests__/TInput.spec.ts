import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TInput from '../../components/forms/TInput.vue'

describe('TInput', () => {
  it('affiche la valeur de modelValue', () => {
    const wrapper = mount(TInput, { props: { modelValue: 'abc' } })
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('abc')
  })
  it('émet update:modelValue à la saisie', async () => {
    const wrapper = mount(TInput)
    await wrapper.find('input').setValue('bonjour')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['bonjour'])
  })
  it('associe le label au champ (for/id)', () => {
    const wrapper = mount(TInput, { props: { label: 'Nom' } })
    expect(wrapper.find('label').attributes('for')).toBe(wrapper.find('input').attributes('id'))
    expect(wrapper.find('label').text()).toContain('Nom')
  })
  it("affiche l'erreur et la bordure rouge", () => {
    const wrapper = mount(TInput, { props: { error: 'Requis' } })
    expect(wrapper.text()).toContain('Requis')
    expect(wrapper.find('input').classes()).toContain('border-red-400')
  })
  it('ajoute le padding gauche avec un slot prefix', () => {
    const wrapper = mount(TInput, { slots: { prefix: '<span>€</span>' } })
    expect(wrapper.find('input').classes()).toContain('pl-9')
  })
  it('désactivé via disabled', () => {
    const wrapper = mount(TInput, { props: { disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })
})
