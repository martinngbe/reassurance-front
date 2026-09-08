import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TFileInput from '../../components/forms/TFileInput.vue'

describe('TFileInput', () => {
  it('affiche le libellé et le texte par défaut', () => {
    const wrapper = mount(TFileInput, { props: { label: 'CV' } })
    expect(wrapper.text()).toContain('CV')
    expect(wrapper.text()).toContain('Cliquer pour choisir un fichier…')
  })
  it('propage accept et multiple', () => {
    const wrapper = mount(TFileInput, { props: { accept: '.pdf', multiple: true } })
    const input = wrapper.find('input[type=file]')
    expect(input.attributes('accept')).toBe('.pdf')
    expect(input.attributes('multiple')).toBeDefined()
  })
  it('désactivé via disabled', () => {
    const wrapper = mount(TFileInput, { props: { disabled: true } })
    expect(wrapper.find('input[type=file]').attributes('disabled')).toBeDefined()
  })
})
