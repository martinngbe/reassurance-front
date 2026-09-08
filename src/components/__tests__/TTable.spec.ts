import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TTable from '../display/TTable.vue'
import type { TableColumn, TableRow } from '../forms/common'

type SlotParams = { value: unknown; row: TableRow; column: TableColumn }

const columns: TableColumn[] = [
  { key: 'nom', label: 'Nom' },
  { key: 'role', label: 'Rôle' },
  { key: 'actions', label: 'Actions', align: 'right' },
]

const rows: TableRow[] = [
  { nom: 'Awa Diop', role: 'Designer' },
  { nom: 'Karim Benali', role: 'Développeur' },
]

const factory = (props: object = {}, slots: object = {}) =>
  mount(TTable, { props: { columns, rows, ...props }, slots })

describe('TTable', () => {
  it("affiche une colonne d'en-tête par entrée de `columns`", () => {
    const wrapper = factory()
    const headers = wrapper.findAll('thead th')
    expect(headers).toHaveLength(3)
    expect(headers[0].text()).toBe('Nom')
    expect(headers[1].text()).toBe('Rôle')
    expect(headers[2].text()).toBe('Actions')
  })

  it('affiche une ligne par entrée de `rows` avec les bonnes valeurs', () => {
    const wrapper = factory()
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows).toHaveLength(2)

    const firstCells = bodyRows[0].findAll('td')
    expect(firstCells[0].text()).toBe('Awa Diop')
    expect(firstCells[1].text()).toBe('Designer')
  })

  it('affiche le message vide par défaut quand `rows` est vide', () => {
    const wrapper = factory({ rows: [] })
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
    expect(wrapper.find('tbody td').text()).toBe('Aucune donnée')
  })

  it('utilise un `emptyMessage` personnalisé', () => {
    const wrapper = factory({ rows: [], emptyMessage: 'Rien à afficher' })
    expect(wrapper.find('tbody td').text()).toBe('Rien à afficher')
  })

  it('donne au message vide un colspan égal au nombre de colonnes', () => {
    const wrapper = factory({ rows: [] })
    expect(wrapper.find('tbody td').attributes('colspan')).toBe('3')
  })

  it("applique l'alignement `right` sur la colonne Actions", () => {
    const wrapper = factory()
    const lastHeader = wrapper.findAll('thead th')[2]
    expect(lastHeader.classes()).toContain('text-right')
  })

  it('aligne à gauche par défaut', () => {
    const wrapper = factory()
    expect(wrapper.findAll('thead th')[0].classes()).toContain('text-left')
  })

  it('applique la classe de survol par défaut (hoverable)', () => {
    const wrapper = factory()
    const firstRow = wrapper.findAll('tbody tr')[0]
    expect(firstRow.classes()).toContain('hover:bg-primary-500/5')
  })

  it('zèbre les lignes impaires quand `striped` est actif', () => {
    const wrapper = factory({ striped: true })
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows[0].classes()).not.toContain('bg-neutral-50/60')
    expect(bodyRows[1].classes()).toContain('bg-neutral-50/60')
  })

  it('utilise le slot nommé `cell-<key>` pour un rendu personnalisé', () => {
    const wrapper = factory(
      {},
      {
        'cell-role': ({ value }: SlotParams) => `[${value}]`,
      },
    )
    const firstRowCells = wrapper.findAll('tbody tr')[0].findAll('td')
    expect(firstRowCells[1].text()).toBe('[Designer]')
  })

  it('utilise le slot générique `cell` si le slot nommé est absent', () => {
    const wrapper = factory(
      {},
      {
        cell: ({ value }: SlotParams) => `★ ${value}`,
      },
    )
    const firstCell = wrapper.findAll('tbody tr')[0].findAll('td')[0]
    expect(firstCell.text()).toBe('★ Awa Diop')
  })

  it('priorise le slot nommé sur le slot générique', () => {
    const wrapper = factory(
      {},
      {
        'cell-nom': ({ value }: SlotParams) => `NOM:${value}`,
        cell: ({ value }: SlotParams) => `GEN:${value}`,
      },
    )
    const firstCell = wrapper.findAll('tbody tr')[0].findAll('td')[0]
    expect(firstCell.text()).toBe('NOM:Awa Diop')
  })
})
