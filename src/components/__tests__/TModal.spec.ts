import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import TModal from '../../components/display/TModal.vue'

describe('TModal', () => {
  it('affiche le dialog quand ouvert', async () => {
    const wrapper = mount(TModal, { props: { modelValue: true, title: 'Titre' } })
    await nextTick()
    expect(document.body.querySelector('[role=dialog]')).not.toBeNull()
    wrapper.unmount()
  })

  it("n'affiche rien quand fermé", async () => {
    const wrapper = mount(TModal, { props: { modelValue: false } })
    await nextTick()
    expect(document.body.querySelector('[role=dialog]')).toBeNull()
    wrapper.unmount()
  })

  it('émet false via le bouton fermer', async () => {
    const wrapper = mount(TModal, { props: { modelValue: true } })
    await nextTick()
    ;(document.body.querySelector('button[aria-label="Fermer"]') as HTMLElement).click()
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('se ferme avec Échap', async () => {
    const wrapper = mount(TModal, { props: { modelValue: true } })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    wrapper.unmount()
  })

  it('ne se ferme pas avec Échap si persistent', async () => {
    const wrapper = mount(TModal, { props: { modelValue: true, persistent: true } })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    wrapper.unmount()
  })
})
