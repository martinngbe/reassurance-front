import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TCard from '../../components/display/TCard.vue'

describe('TCard', () => {
  it('rend les slots header / default / footer', () => {
    const wrapper = mount(TCard, {
      slots: { header: '<h2>H</h2>', default: '<p>Body</p>', footer: '<span>F</span>' },
    })
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.text()).toContain('Body')
  })

  it('pas de header si slot absent', () => {
    expect(
      mount(TCard, { slots: { default: 'x' } })
        .find('header')
        .exists(),
    ).toBe(false)
  })

  it('padded ajoute / retire p-5', () => {
    expect(
      mount(TCard, { slots: { default: 'x' } })
        .find('.p-5')
        .exists(),
    ).toBe(true)
    expect(
      mount(TCard, { props: { padded: false }, slots: { default: 'x' } })
        .find('.p-5')
        .exists(),
    ).toBe(false)
  })

  it('hoverable ajoute la classe de survol', () => {
    expect(mount(TCard, { props: { hoverable: true } }).classes()).toContain('hover:shadow-md')
  })
})
