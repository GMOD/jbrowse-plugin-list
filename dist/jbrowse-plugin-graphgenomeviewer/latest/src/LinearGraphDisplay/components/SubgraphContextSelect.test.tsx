import { render, screen } from '@testing-library/react'

import SubgraphContextSelect from './SubgraphContextSelect'

import type { LinearGraphCutModel } from '../model'

const shown = (adapterConfig: Record<string, unknown>) => {
  render(
    <SubgraphContextSelect
      model={
        {
          sourceAdapter: adapterConfig,
          subgraphContext: 1,
        } as unknown as LinearGraphCutModel
      }
    />,
  )
  return screen.queryByTestId('graph-context-select') !== null
}

test('graph context shows for an rGFA cut from segment rows only', () => {
  expect(shown({ type: 'RgfaTabixAdapter', uri: 'graph' })).toBe(true)
})

test('a walk-indexed rGFA cut follows its walks, so graph context is hidden', () => {
  expect(shown({ type: 'RgfaTabixAdapter', walksUri: 'chr22' })).toBe(false)
})
