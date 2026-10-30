import stateModelFactory from './model'

import type { MenuItem } from '@jbrowse/core/ui'

const samples = [{ name: 'HG00097', population: 'GBR', superpopulation: 'EUR' }]

test('a snapshot may name the facet by its field alone', () => {
  const view = stateModelFactory().create({
    type: 'TandemRepeatView',
    samples,
    facet: 'superpopulation',
  })
  expect(view.facet).toEqual({ field: 'superpopulation' })
})

test('Group by… offers None and each metadata column, as written', () => {
  const view = stateModelFactory().create({ type: 'TandemRepeatView', samples })
  const [groupBy] = view.menuItems() as (MenuItem & { subMenu: MenuItem[] })[]
  expect(groupBy!.label).toBe('Group by…')
  const items = groupBy!.subMenu as (MenuItem & {
    label: string
    checked: boolean
    onClick: () => void
  })[]
  expect(items.map(i => [i.label, i.checked])).toEqual([
    ['None', true],
    ['population', false],
    ['superpopulation', false],
  ])
  items[2]!.onClick()
  expect(view.facet).toEqual({ field: 'superpopulation' })
  items[0]!.onClick()
  expect(view.facet).toBeUndefined()
})
